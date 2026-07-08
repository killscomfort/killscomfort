import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createOrder, type PrintfulRecipient } from "@/lib/printful";
import { PRINTFUL_SYNC_VARIANTS, MERCH_PRODUCTS } from "@/config/merch.config";

/**
 * Stripe webhook: checkout.session.completed
 *   1. Record the order in Supabase
 *   2. Create + confirm the Printful order (auto-fulfill)
 *   3. Email confirmation via Resend
 *
 * NOTE for Cursor: if killscomfort.com already has a Stripe webhook route
 * (donations / existing merch), MERGE the `checkout.session.completed`
 * branch below into it instead of registering a second endpoint —
 * the `metadata.merch === "1"` guard keeps flows separate.
 */

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function parseCart(cart: string) {
  // "KC-CROP-BLK-M:2|KC-SWEATS-WHT-L:1"
  return cart.split("|").map((entry) => {
    const [sku, qty] = entry.split(":");
    const [, code, colorCode, ...sizeParts] = sku.split("-");
    const slugMap: Record<string, string> = { SHORTS: "booty-shorts", CROP: "crop-top", SWEATS: "sweatpants" };
    return {
      sku,
      slug: slugMap[code] ?? code.toLowerCase(),
      color: colorCode === "BLK" ? "black" : "white",
      size: sizeParts.join("-"),
      quantity: parseInt(qty, 10) || 1,
    };
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe webhook] bad signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.merch !== "1" || !session.metadata.cart) {
    if (session.metadata?.type === "merch") {
      const legacyReq = new NextRequest(req.url, {
        method: "POST",
        body,
        headers: req.headers,
      });
      const { POST: legacyPost } = await import("@/app/api/stripe/webhook/route");
      return legacyPost(legacyReq);
    }
    return NextResponse.json({ received: true });
  }

  const db = supabaseAdmin();
  const items = parseCart(session.metadata.cart);
  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? "";
  const ship = session.collected_information?.shipping_details ?? session.customer_details;

  // 1. Record order (idempotent on stripe_session_id)
  const { data: order, error: dbErr } = await db
    .from("merch_orders")
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        email,
        customer_name: name,
        amount_total_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        shipping_address: ship?.address ?? null,
        status: "paid",
      },
      { onConflict: "stripe_session_id" }
    )
    .select()
    .single();

  if (dbErr || !order) {
    console.error("[stripe webhook] supabase insert failed", dbErr);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const priceBySlug = Object.fromEntries(MERCH_PRODUCTS.map((p) => [p.slug, p.priceCents]));
  await db.from("merch_order_items").delete().eq("order_id", order.id); // idempotency
  await db.from("merch_order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      sku: i.sku,
      product_slug: i.slug,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unit_price_cents: priceBySlug[i.slug] ?? 0,
    }))
  );

  // 2. Forward to Printful
  const printfulItems = items.map((i) => ({
    sync_variant_id: PRINTFUL_SYNC_VARIANTS[i.sku],
    quantity: i.quantity,
  }));

  if (printfulItems.some((i) => !i.sync_variant_id)) {
    console.warn("[stripe webhook] missing Printful sync variant(s) — run `npm run printful:sync`. Order saved, needs manual fulfillment:", order.id);
    await db.from("merch_orders").update({ status: "failed", failure_reason: "missing_printful_variant_mapping" }).eq("id", order.id);
  } else if (ship?.address) {
    try {
      const addr = ship.address;
      const recipient: PrintfulRecipient = {
        name: ship.name ?? name,
        address1: addr.line1 ?? "",
        address2: addr.line2 ?? undefined,
        city: addr.city ?? "",
        state_code: addr.state ?? undefined,
        country_code: addr.country ?? "US",
        zip: addr.postal_code ?? "",
        email,
        phone: session.customer_details?.phone ?? undefined,
      };
      const pfOrder = await createOrder(recipient, printfulItems, session.id);
      await db
        .from("merch_orders")
        .update({ printful_order_id: pfOrder.id, status: "submitted_to_printful" })
        .eq("id", order.id);
    } catch (err) {
      console.error("[stripe webhook] printful order failed", err);
      await db
        .from("merch_orders")
        .update({ status: "failed", failure_reason: String(err).slice(0, 500) })
        .eq("id", order.id);
    }
  }

  // 3. Confirmation email
  if (email) {
    try {
      await getResend().emails.send({
        from: "KillsComfort <orders@killscomfort.com>",
        to: email,
        subject: "Order confirmed — KillsComfort",
        html: `
          <div style="font-family:Helvetica,Arial,sans-serif;background:#0b0b0d;color:#e8e8ea;padding:32px;border-radius:12px">
            <h1 style="letter-spacing:2px;font-weight:800">KILLSCOMFORT</h1>
            <p>${name ? name + ", y" : "Y"}our order is in. We're on it.</p>
            <ul style="line-height:1.8">
              ${items.map((i) => `<li>${i.quantity}× ${i.slug.replace(/-/g, " ")} — ${i.color} / ${i.size}</li>`).join("")}
            </ul>
            <p style="color:#9a9aa0">Total: $${((session.amount_total ?? 0) / 100).toFixed(2)}</p>
            <p style="color:#9a9aa0">You'll get tracking as soon as it ships. Kill comfort.</p>
          </div>`,
      });
    } catch (err) {
      console.error("[stripe webhook] resend failed", err);
    }
  }

  return NextResponse.json({ received: true });
}
