import { z } from "zod";
import { cartHasServices, cartRequiresShipping, getCatalogItem } from "@/lib/catalog";

const cartLineSchema = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  size: z.string().optional(),
});

const customerFields = {
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.string().email("Valid email required"),
  customer_phone: z.string().trim().min(1, "Phone number is required"),
};

const shippingFields = {
  shipping_line1: z.string().optional(),
  shipping_line2: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_postal_code: z.string().optional(),
  shipping_country: z.string().optional(),
};

export const checkoutSchema = z
  .object({
    ...customerFields,
    items: z.array(cartLineSchema).min(1, "Cart is empty"),
    ...shippingFields,
    event_date: z.string().optional(),
    event_notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!cartRequiresShipping(data.items)) return;

    const required: [keyof typeof shippingFields, string][] = [
      ["shipping_line1", "Street address is required"],
      ["shipping_city", "City is required"],
      ["shipping_state", "State is required"],
      ["shipping_postal_code", "ZIP code is required"],
    ];

    for (const [field, message] of required) {
      if (!data[field]?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** @deprecated Use cartRequiresShipping */
export function orderRequiresShipping(items: CheckoutInput["items"]) {
  return cartRequiresShipping(items);
}

export function orderHasServices(items: CheckoutInput["items"]) {
  return cartHasServices(items);
}

export function isServiceOnlyOrder(items: CheckoutInput["items"]) {
  return (
    items.length > 0 &&
    items.every((line) => getCatalogItem(line.slug)?.kind === "service")
  );
}
