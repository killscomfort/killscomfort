import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/merch";
import { getCatalogItem } from "@/lib/catalog";
import {
  getEmailFrom,
  getOrdersNotificationEmail,
  sendEmail,
} from "@/lib/resend-client";
import {
  emailButton,
  emailDetailBlock,
  emailList,
  emailParagraph,
  escapeHtml,
  renderEmailLayout,
} from "@/lib/email-template";
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
  return items.map(
    (item) =>
      `${escapeHtml(item.product_name)}${item.size ? ` (${escapeHtml(item.size)})` : ""} × ${item.quantity} — ${formatPrice(item.line_total_cents)}`
  );
}

function renderAddress(shipping: OrderShipping) {
  if (shipping.line1.startsWith("Service order")) {
    return null;
  }

  return [
    escapeHtml(shipping.line1),
    shipping.line2 ? escapeHtml(shipping.line2) : null,
    escapeHtml(`${shipping.city}, ${shipping.state} ${shipping.postal_code}`),
    escapeHtml(shipping.country),
  ]
    .filter(Boolean)
    .join("<br/>");
}

function renderEventDetailRows(shipping: OrderShipping) {
  const rows: { label: string; value: string }[] = [];

  if (shipping.event_date) {
    rows.push({ label: "Preferred date", value: escapeHtml(shipping.event_date) });
  }

  if (shipping.event_notes) {
    rows.push({
      label: "Notes",
      value: escapeHtml(shipping.event_notes).replace(/\n/g, "<br/>"),
    });
  }

  return rows;
}

export async function sendOrderNotification(payload: OrderEmailPayload) {
  const service = isServiceOrder(payload.items);
  const address = renderAddress(payload.shipping);
  const label = service ? "Booking / service payment" : "Merch order";

  const detailRows = [
    { label: "Order", value: escapeHtml(payload.orderNumber) },
    { label: "Customer", value: escapeHtml(payload.customerName) },
    {
      label: "Email",
      value: `<a href="mailto:${escapeHtml(payload.customerEmail)}" style="color:#ffffff;">${escapeHtml(payload.customerEmail)}</a>`,
    },
    ...(payload.customerPhone
      ? [{ label: "Phone", value: escapeHtml(payload.customerPhone) }]
      : []),
    ...(address ? [{ label: "Ship to", value: address }] : []),
    ...renderEventDetailRows(payload.shipping),
    { label: "Total", value: formatPrice(payload.totalCents) },
  ];

  const content = [
    emailParagraph(`A new ${service ? "service" : "merch"} order was placed.`),
    emailDetailBlock(detailRows),
    emailParagraph("<strong>Items</strong>"),
    emailList(renderItems(payload.items)),
    emailButton(`${SITE.url}/admin/orders`, "View in admin"),
  ].join("");

  return sendEmail({
    to: getOrdersNotificationEmail(),
    subject: `New ${label} ${payload.orderNumber} — ${formatPrice(payload.totalCents)}`,
    html: renderEmailLayout({
      title: `New ${label}`,
      preheader: `${payload.customerName} — ${formatPrice(payload.totalCents)}`,
      content,
    }),
  });
}

export async function sendOrderConfirmation(payload: OrderEmailPayload) {
  const service = isServiceOrder(payload.items);
  const address = renderAddress(payload.shipping);

  const title = service ? "Booking confirmed" : "Order confirmed";
  const intro = service
    ? `Your payment for <strong>${escapeHtml(payload.orderNumber)}</strong> is confirmed. We'll follow up within 24–48 hours with next steps for your booking.`
    : `Your order <strong>${escapeHtml(payload.orderNumber)}</strong> is confirmed. We'll follow up when your merch ships.`;
  const footer = service
    ? "If you have questions before we reach out, reply to this email or contact us through the site."
    : "You'll receive shipping updates by email once your order is on the way.";

  const detailRows = [
    { label: "Total paid", value: formatPrice(payload.totalCents) },
    ...(address ? [{ label: "Shipping to", value: address }] : []),
    ...renderEventDetailRows(payload.shipping),
  ];

  const content = [
    emailParagraph(`Thanks, <strong>${escapeHtml(payload.customerName)}</strong>.`),
    emailParagraph(intro),
    emailDetailBlock(detailRows),
    emailParagraph("<strong>Items</strong>"),
    emailList(renderItems(payload.items)),
    emailParagraph(footer),
    emailButton(`${SITE.url}/music`, "Listen to the latest mixes"),
  ].join("");

  return sendEmail({
    to: payload.customerEmail,
    subject: `${title} — ${payload.orderNumber}`,
    html: renderEmailLayout({
      title,
      preheader: `${payload.orderNumber} — ${formatPrice(payload.totalCents)}`,
      content,
    }),
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
