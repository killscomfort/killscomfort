import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getMerchItem } from "@/lib/merch";
import { hasPrintfulVariant, resolvePrintfulVariantId } from "@/lib/merch-printful";
import { createPrintfulOrder } from "@/lib/printful";
import {
  lockFulfillmentRecord,
  updateFulfillmentRecord,
} from "@/lib/stripe-fulfillment";
import {
  persistStripeMerchOrder,
  type MerchCartLine,
} from "@/lib/orders/stripe-merch";

export const runtime = "nodejs";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

function parseQuantity(value: string | number | undefined, fallback = 1) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
    throw new Error(`Invalid merch quantity: "${value}"`);
  }
  return parsed;
}

function parseMerchCart(metadata: Stripe.Metadata): MerchCartLine[] {
  if (metadata.cart) {
    const parsed = JSON.parse(metadata.cart) as MerchCartLine[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid merch cart metadata");
    }

    return parsed.map((line) => ({
      slug: line.slug,
      size: line.size || undefined,
      quantity: parseQuantity(line.quantity, 1),
    }));
  }

  const slug = metadata.slug;
  if (!slug) {
    throw new Error("Missing merch slug in checkout session metadata");
  }

  return [
    {
      slug,
      size: metadata.size || undefined,
      quantity: parseQuantity(metadata.quantity, 1),
    },
  ];
}

function requireAddressField(value: string | null | undefined, fieldName: string) {
  if (!value || !value.trim()) {
    throw new Error(`Missing shipping field: ${fieldName}`);
  }
  return value.trim();
}

export async function POST(request: NextRequest) {
  let recordId: string | null = null;
  let stripeSessionIdForLog: string | null = null;

  try {
    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature header" }, { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // Academy Full Spectrum unlock
    if (metadata.type === "academy") {
      const userId =
        metadata.user_id || session.client_reference_id || null;
      if (
        userId &&
        ["paid", "no_payment_required"].includes(session.payment_status)
      ) {
        const { createClient } = await import("@supabase/supabase-js");
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { error } = await admin
          .from("profiles")
          .update({
            has_full_access: true,
            stripe_customer_id: String(session.customer ?? ""),
          })
          .eq("id", userId);

        if (error) {
          console.error("[stripe-webhook] academy unlock failed", {
            userId,
            message: error.message,
          });
          return NextResponse.json(
            { error: "academy_unlock_failed", message: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          received: true,
          academy: true,
          userId,
        });
      }

      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "academy_session_incomplete",
      });
    }

    if (metadata.type !== "merch") {
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "non-merch session",
      });
    }

    const stripeSessionId = session.id;
    stripeSessionIdForLog = stripeSessionId;
    const lock = await lockFulfillmentRecord(stripeSessionId, event.id);
    recordId = lock.recordId;

    if (lock.alreadyFulfilled) {
      console.log("[stripe-webhook] already fulfilled, skipping", {
        stripeSessionId,
        eventId: event.id,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (lock.inProgress) {
      console.log("[stripe-webhook] fulfillment already processing, skipping", {
        stripeSessionId,
        eventId: event.id,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }

    const cartLines = parseMerchCart(metadata);
    const printfulLines = cartLines.filter((line) =>
      hasPrintfulVariant(line.slug, line.size)
    );
    const manualLines = cartLines.filter(
      (line) => !hasPrintfulVariant(line.slug, line.size)
    );

    const orderResult = await persistStripeMerchOrder({
      session,
      cartLines,
      stripeSessionId,
    });

    if (printfulLines.length === 0) {
      await updateFulfillmentRecord({
        recordId,
        status: "fulfilled",
        notes: `manual_ship;order=${orderResult.order.order_number};items=${cartLines.length}`,
      });

      console.log("[stripe-webhook] manual merch order recorded", {
        stripeSessionId,
        orderNumber: orderResult.order.order_number,
        items: cartLines,
      });

      return NextResponse.json({
        received: true,
        fulfilled: true,
        manual: true,
        orderNumber: orderResult.order.order_number,
      });
    }

    const shippingDetails =
      session.collected_information?.shipping_details || session.customer_details;
    const shippingAddress = shippingDetails?.address;

    const recipientName =
      shippingDetails?.name || session.customer_email || "Customer";

    const recipientEmail =
      session.customer_details?.email || session.customer_email || "";
    if (!recipientEmail) {
      throw new Error("Missing customer email in Stripe session");
    }

    if (!shippingAddress) {
      throw new Error("Missing shipping address in Stripe session");
    }

    const printfulItems = printfulLines.map((line) => {
      const merchItem = getMerchItem(line.slug);
      if (!merchItem) {
        throw new Error(`Unknown merch slug from Stripe metadata: "${line.slug}"`);
      }

      return {
        variant_id: resolvePrintfulVariantId(line.slug, line.size),
        quantity: line.quantity,
        retail_price: (merchItem.priceCents / 100).toFixed(2),
        name: merchItem.name,
      };
    });

    const externalId = `stripe-session-${stripeSessionId}`;
    const printfulResult = await createPrintfulOrder({
      externalId,
      recipient: {
        name: recipientName,
        email: recipientEmail,
        phone: session.customer_details?.phone || null,
        address1: requireAddressField(shippingAddress.line1, "line1"),
        address2: shippingAddress.line2 || null,
        city: requireAddressField(shippingAddress.city, "city"),
        state_code: shippingAddress.state || null,
        country_code: requireAddressField(shippingAddress.country, "country"),
        zip: requireAddressField(shippingAddress.postal_code, "postal_code"),
      },
      items: printfulItems,
    });

    const notes = [
      `order=${orderResult.order.order_number}`,
      `printful_items=${printfulLines.length}`,
      manualLines.length ? `manual_items=${manualLines.length}` : null,
      `external_id=${printfulResult.externalId}`,
    ]
      .filter(Boolean)
      .join(";");

    await updateFulfillmentRecord({
      recordId,
      status: "fulfilled",
      printfulOrderId: printfulResult.printfulOrderId,
      notes,
    });

    console.log("[stripe-webhook] fulfilled merch order", {
      stripeSessionId,
      orderNumber: orderResult.order.order_number,
      printfulOrderId: printfulResult.printfulOrderId,
      printfulItems: printfulLines,
      manualItems: manualLines,
    });

    return NextResponse.json({
      received: true,
      fulfilled: true,
      orderNumber: orderResult.order.order_number,
      printful: true,
    });
  } catch (error) {
    console.error("[stripe-webhook] fulfillment failed", {
      stripeSessionId: stripeSessionIdForLog,
      error,
    });

    if (recordId) {
      try {
        await updateFulfillmentRecord({
          recordId,
          status: "failed",
          notes: error instanceof Error ? error.message : "Unknown webhook error",
        });
      } catch (updateError) {
        console.error("[stripe-webhook] failed to update fulfillment status", updateError);
      }
    }

    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
