import type Stripe from "stripe";
import { getMerchItem } from "@/lib/merch";
import { createServiceClient } from "@/lib/supabase/server";
import {
  calculateOrderTotal,
  createOrderNumber,
  type ValidatedOrderItem,
} from "@/lib/orders/helpers";
import {
  sendOrderConfirmation,
  sendOrderNotification,
} from "@/lib/orders/email";

export type MerchCartLine = {
  slug: string;
  size?: string;
  quantity: number;
};

export function buildMerchOrderItems(cartLines: MerchCartLine[]): ValidatedOrderItem[] {
  return cartLines.map((line) => {
    const item = getMerchItem(line.slug);
    if (!item) {
      throw new Error(`Unknown merch slug from Stripe metadata: "${line.slug}"`);
    }

    return {
      product_slug: line.slug,
      product_name: item.name,
      price_cents: item.priceCents,
      quantity: line.quantity,
      size: line.size ?? null,
      line_total_cents: item.priceCents * line.quantity,
    };
  });
}

function buildShippingAddress(address: Stripe.Address) {
  return {
    line1: address.line1 || "",
    line2: address.line2 || null,
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postal_code || "",
    country: address.country || "US",
    event_date: null,
    event_notes: null,
  };
}

export async function persistStripeMerchOrder(params: {
  session: Stripe.Checkout.Session;
  cartLines: MerchCartLine[];
  stripeSessionId: string;
}) {
  const { session, cartLines, stripeSessionId } = params;
  const supabase = await createServiceClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  if (existing) {
    return { order: existing, created: false as const };
  }

  const shippingDetails =
    session.collected_information?.shipping_details || session.customer_details;
  const shippingAddress = shippingDetails?.address;

  const customerName =
    shippingDetails?.name || session.customer_details?.name || "Customer";
  const customerEmail =
    session.customer_details?.email || session.customer_email || "";

  if (!customerEmail) {
    throw new Error("Missing customer email in Stripe session");
  }

  if (!shippingAddress?.line1) {
    throw new Error("Missing shipping address in Stripe session");
  }

  const items = buildMerchOrderItems(cartLines);
  const calculatedTotal = calculateOrderTotal(items);
  const totalCents =
    typeof session.amount_total === "number" ? session.amount_total : calculatedTotal;

  const orderNumber = createOrderNumber();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: session.customer_details?.phone || null,
      shipping_address: buildShippingAddress(shippingAddress),
      subtotal_cents: calculatedTotal,
      total_cents: totalCents,
      status: "paid",
      stripe_session_id: stripeSessionId,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    throw new Error(
      `Failed to save merch order for Stripe session ${stripeSessionId}: ${orderError?.message || "unknown error"}`
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_slug: item.product_slug,
      product_name: item.product_name,
      price_cents: item.price_cents,
      quantity: item.quantity,
      size: item.size,
    }))
  );

  if (itemsError) {
    throw new Error(
      `Failed to save order items for ${order.order_number}: ${itemsError.message}`
    );
  }

  const emailPayload = {
    orderNumber: order.order_number,
    customerName,
    customerEmail,
    customerPhone: session.customer_details?.phone || null,
    shipping: buildShippingAddress(shippingAddress),
    items,
    totalCents,
  };

  const [notificationResult, confirmationResult] = await Promise.all([
    sendOrderNotification(emailPayload),
    sendOrderConfirmation(emailPayload),
  ]);

  if (!notificationResult.ok && !notificationResult.skipped) {
    console.error("[stripe-merch] admin order email failed", notificationResult.error);
  }

  if (!confirmationResult.ok && !confirmationResult.skipped) {
    console.error("[stripe-merch] customer confirmation email failed", confirmationResult.error);
  }

  return { order, created: true as const };
}
