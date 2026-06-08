import { Resend } from "resend";
import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/merch";
import type { ValidatedOrderItem } from "./helpers";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type OrderEmailPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shipping: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: ValidatedOrderItem[];
  totalCents: number;
};

function renderItems(items: ValidatedOrderItem[]) {
  return items
    .map(
      (item) =>
        `<li>${item.product_name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} — ${formatPrice(item.line_total_cents)}</li>`
    )
    .join("");
}

function renderAddress(shipping: OrderEmailPayload["shipping"]) {
  return [
    shipping.line1,
    shipping.line2,
    `${shipping.city}, ${shipping.state} ${shipping.postal_code}`,
    shipping.country,
  ]
    .filter(Boolean)
    .join("<br/>");
}

export async function sendOrderNotification(payload: OrderEmailPayload) {
  if (!resend) {
    console.log("[email] Resend not configured — skipping order notification");
    return;
  }

  const to =
    process.env.ORDERS_NOTIFICATION_EMAIL ||
    process.env.INQUIRY_NOTIFICATION_EMAIL ||
    SITE.email;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || `${SITE.name} <${SITE.email}>`,
    to,
    subject: `New Merch Order ${payload.orderNumber} — ${formatPrice(payload.totalCents)}`,
    html: `
      <h2>New Merch Order</h2>
      <p><strong>Order:</strong> ${payload.orderNumber}</p>
      <p><strong>Customer:</strong> ${payload.customerName}</p>
      <p><strong>Email:</strong> ${payload.customerEmail}</p>
      ${payload.customerPhone ? `<p><strong>Phone:</strong> ${payload.customerPhone}</p>` : ""}
      <p><strong>Ship to:</strong><br/>${renderAddress(payload.shipping)}</p>
      <p><strong>Items:</strong></p>
      <ul>${renderItems(payload.items)}</ul>
      <p><strong>Total:</strong> ${formatPrice(payload.totalCents)}</p>
      <p>View in admin: ${SITE.url}/admin/orders</p>
    `,
  });
}

export async function sendOrderConfirmation(payload: OrderEmailPayload) {
  if (!resend) {
    console.log("[email] Resend not configured — skipping order confirmation");
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || `${SITE.name} <${SITE.email}>`,
    to: payload.customerEmail,
    subject: `Order confirmed — ${payload.orderNumber}`,
    html: `
      <h2>Thanks, ${payload.customerName}.</h2>
      <p>Your ${SITE.name} order <strong>${payload.orderNumber}</strong> is confirmed.</p>
      <p><strong>Total paid:</strong> ${formatPrice(payload.totalCents)}</p>
      <p><strong>Items:</strong></p>
      <ul>${renderItems(payload.items)}</ul>
      <p><strong>Shipping to:</strong><br/>${renderAddress(payload.shipping)}</p>
      <p>We'll follow up when your order ships.</p>
      <p>— ${SITE.name}</p>
    `,
  });
}
