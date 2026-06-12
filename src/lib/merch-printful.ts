import { getMerchItem } from "@/lib/merch";

export type MerchVariantMapping = {
  variantId: number;
};

export const MERCH_PRINTFUL_VARIANTS: Record<
  string,
  Record<string, MerchVariantMapping>
> = {
  "diamond-hoodie": {
    S: { variantId: 0 },
    M: { variantId: 0 },
    L: { variantId: 0 },
    XL: { variantId: 0 },
  },
  // Add future size/variant mappings here:
  // "kills-shorts": { "32": { variantId: 0 }, ... }
  // "die-cut-stickers": { DEFAULT: { variantId: 0 } }
};

export function resolvePrintfulVariantId(slug: string, size?: string | null) {
  const item = getMerchItem(slug);
  if (!item) {
    throw new Error(`Unknown merch item slug "${slug}"`);
  }

  const sizeKey = (size || "DEFAULT").toUpperCase();
  const itemMapping = MERCH_PRINTFUL_VARIANTS[slug];
  const variant = itemMapping?.[sizeKey];

  if (!variant?.variantId || variant.variantId <= 0) {
    throw new Error(
      `Missing Printful variant mapping for "${slug}" size "${sizeKey}".`
    );
  }

  return variant.variantId;
}
