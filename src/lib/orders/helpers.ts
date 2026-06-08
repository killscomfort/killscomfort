import { getCatalogItem } from "@/lib/catalog";
import type { CheckoutInput } from "./validation";

export type ValidatedOrderItem = {
  product_slug: string;
  product_name: string;
  price_cents: number;
  quantity: number;
  size: string | null;
  line_total_cents: number;
};

export function buildOrderItems(items: CheckoutInput["items"]) {
  const validated: ValidatedOrderItem[] = [];

  for (const line of items) {
    const product = getCatalogItem(line.slug);
    if (!product) {
      throw new Error(`Unknown item: ${line.slug}`);
    }
    if (product.kind === "merch" && product.sizes?.length && !line.size) {
      throw new Error(`Size is required for ${product.name}`);
    }
    if (
      line.size &&
      product.kind === "merch" &&
      product.sizes &&
      !product.sizes.includes(line.size)
    ) {
      throw new Error(`Invalid size for ${product.name}`);
    }

    validated.push({
      product_slug: product.slug,
      product_name: product.name,
      price_cents: product.priceCents,
      quantity: line.quantity,
      size: line.size ?? null,
      line_total_cents: product.priceCents * line.quantity,
    });
  }

  return validated;
}

export function calculateOrderTotal(items: ValidatedOrderItem[]) {
  return items.reduce((sum, item) => sum + item.line_total_cents, 0);
}

export function createOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  return `KC-${stamp}`;
}

export function buildShippingAddress(data: CheckoutInput) {
  if (data.order_kind === "service" || !("shipping_line1" in data)) {
    return {
      line1: "Service order — no shipping",
      line2: null,
      city: "Miami",
      state: "FL",
      postal_code: "33101",
      country: "US",
      event_date: data.order_kind === "service" ? data.event_date ?? null : null,
      event_notes: data.order_kind === "service" ? data.event_notes ?? null : null,
    };
  }

  return {
    line1: data.shipping_line1,
    line2: data.shipping_line2 || null,
    city: data.shipping_city,
    state: data.shipping_state,
    postal_code: data.shipping_postal_code,
    country: data.shipping_country,
    event_date: null,
    event_notes: null,
  };
}
