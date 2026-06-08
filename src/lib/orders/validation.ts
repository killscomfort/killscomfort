import { z } from "zod";
import { getCatalogItem } from "@/lib/catalog";

const cartLineSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  size: z.string().optional(),
});

const customerFields = {
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.string().email("Valid email required"),
  customer_phone: z.string().optional(),
};

const shippingFields = {
  shipping_line1: z.string().min(3, "Street address is required"),
  shipping_line2: z.string().optional(),
  shipping_city: z.string().min(2, "City is required"),
  shipping_state: z.string().min(2, "State is required"),
  shipping_postal_code: z.string().min(3, "ZIP code is required"),
  shipping_country: z.string().default("US"),
};

export const merchCheckoutSchema = z.object({
  order_kind: z.literal("merch").optional().default("merch"),
  ...customerFields,
  ...shippingFields,
  items: z.array(cartLineSchema).min(1, "Cart is empty"),
});

export const serviceCheckoutSchema = z.object({
  order_kind: z.literal("service"),
  ...customerFields,
  items: z.array(cartLineSchema).min(1, "Select a service"),
  event_date: z.string().optional(),
  event_notes: z.string().optional(),
});

export const checkoutSchema = z.union([merchCheckoutSchema, serviceCheckoutSchema]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function orderRequiresShipping(items: CheckoutInput["items"]) {
  return items.some((line) => {
    const product = getCatalogItem(line.slug);
    return product ? product.kind === "merch" : true;
  });
}
