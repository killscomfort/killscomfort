import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/merch";
import { getCatalogItem } from "@/lib/catalog";
import {
  getEmailFrom,
  getOrdersNotificationEmail,
  sendEmail,
} from "@/lib/resend-client";
import type { ValidatedOrderItem } from "./helpers";

type OrderShipping = {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  event_date?: string | null;
  event_notes?: string | null;
};

export type OrderEmailPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shipping: OrderShipping;
  items: ValidatedOrderItem[];
  totalCents: number;
};

function isServiceOrder(items: ValidatedOrderItem[]) {
  return items.every((item) => {
    const catalog = getCatalogItem(item.product_slug);
    return catalog?.kind === "service";
  });
}

function renderItems(items: ValidatedOrderItem[]) {
  return items
    .map(
      (item) =>
        `<li>${item.product_name}${item.size ? ` (${item.size})` : ""} × ${item.quantity} — ${formatPrice(item.line_total_cents)}</li>`
    )
    .join("");
}

function renderAddress(shipping: OrderShipping) {
  if (shipping.line1.startsWith("Service order")) {
    return null;
  }

  return [
    shipping.line1,
    shipping.line2,
    `${shipping.city}, ${shipping.state} ${shipping.postal_code}`,
    shipping.country,
  ]
    .filter(Boolean)
    .join("<br/>");
}

function renderEventDetails(shipping: OrderShipping) {
  if (!shipping.event_date && !shipping.event_notes) return "";

  return `
    ${shipping.event_date ? `<p><strong>Preferred date:</strong> ${shipping.event_date}</p>` : ""}
    ${shipping.event_notes ? `<p><strong>Notes:</strong><br/>${shipping.event_notes}</p>` : ""}
  `;
}

function emailShell(title: string, body: string) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; line-height: 1.6; max-width: 560px;">
      <p style="letter-spacing: 0.2em; text-transform: uppercase; font-size: 12px; color: #8a7344; margin: 0 0 8px;">${SITE.name}</p>
      <h1 style="font-size: 24px; font-weight: 400; margin: 0 0 24px;">${title}</h1>
      ${body}
      <p style="margin-top: 32px; color: #666;">— ${SITE.name}<br/>${SITE.tagline}</p>
      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        <a href="${SITE.url}" style="color: #8a7344;">${SITE.url.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  `;
}

export async function sendOrderNotification(payload: OrderEmailPayload) {
  const service = isServiceOrder(payload.items);
  const address = renderAddress(payload.shipping);
  const label = service ? "Booking / Service Payment" : "Merch Order";

  return sendEmail({
    to: getOrdersNotificationEmail(),
    subject: `New ${label} ${payload.orderNumber} — ${formatPrice(payload.totalCents)}`,
    html: emailShell(`New ${label}`, `
      <p><strong>Order:</strong> ${payload.orderNumber}</p>
      <p><strong>Customer:</strong> ${payload.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${payload.customerEmail}">${payload.customerEmail}</a></p>
      ${payload.customerPhone ? `<p><strong>Phone:</strong> ${payload.customerPhone}</p>` : ""}
      ${address ? `<p><strong>Ship to:</strong><br/>${address}</p>` : ""}
      ${renderEventDetails(payload.shipping)}
      <p><strong>Items:</strong></p>
      <ul>${renderItems(payload.items)}</ul>
      <p><strong>Total:</strong> ${formatPrice(payload.totalCents)}</p>
      <p><a href="${SITE.url}/admin/orders">View in admin</a></p>
    `),
  });
}

export async function sendOrderConfirmation(payload: OrderEmailPayload) {
  const service = isServiceOrder(payload.items);
  const address = renderAddress(payload.shipping);

  const title = service ? "Booking confirmed" : "Order confirmed";
  const intro = service
    ? `Your payment for <strong>${payload.orderNumber}</strong> is confirmed. We'll follow up within 24–48 hours with next steps for your booking.`
    : `Your order <strong>${payload.orderNumber}</strong> is confirmed. We'll follow up when your merch ships.`;
  const footer = service
    ? "If you have questions before we reach out, reply to this email or contact us through the site."
    : "You'll receive shipping updates by email once your order is on the way.";

  return sendEmail({
    to: payload.customerEmail,
    subject: `${title} — ${payload.orderNumber}`,
    html: emailShell(title, `
      <p>Thanks, ${payload.customerName}.</p>
      <p>${intro}</p>
      <p><strong>Total paid:</strong> ${formatPrice(payload.totalCents)}</p>
      <p><strong>Items:</strong></p>
      <ul>${renderItems(payload.items)}</ul>
      ${address ? `<p><strong>Shipping to:</strong><br/>${address}</p>` : ""}
      ${renderEventDetails(payload.shipping)}
      <p>${footer}</p>
      <p><a href="${SITE.url}/music">Listen to the latest mixes</a></p>
    `),
  });
}

/** For local/dev verification without completing checkout. */
export async function sendOrderEmailTest(to: string) {
  const sample: OrderEmailPayload = {
    orderNumber: "KC-TEST123",
    customerName: "Test Customer",
    customerEmail: to,
    shipping: {
      line1: "123 Ocean Drive",
      city: "Miami",
      state: "FL",
      postal_code: "33139",
      country: "US",
    },
    items: [
      {
        product_slug: "die-cut-stickers",
        product_name: "Die-Cut Stickers",
        price_cents: 100,
        quantity: 2,
        size: null,
        line_total_cents: 200,
      },
    ],
    totalCents: 200,
  };

  const [admin, customer] = await Promise.all([
    sendOrderNotification(sample),
    sendOrderConfirmation(sample),
  ]);

  return { admin, customer, from: getEmailFrom() };
}
