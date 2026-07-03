import { getMerchItem } from "@/lib/merch";

export type MerchVariantMapping = {
  variantId: number;
};

/**
 * Printful variant ID TODO map
 *
 * IMPORTANT:
 * - Keep this map in sync with `src/lib/merch.ts`.
 * - Replace every `0` with a real Printful `variant_id` before enabling production fulfillment.
 * - The webhook fails fast when an ID is missing/invalid so orders are never sent to Printful with bad data.
 */
export const MERCH_PRINTFUL_VARIANTS: Record<
  string,
  Record<string, MerchVariantMapping>
> = {
  "diamond-hoodie": {
    S: { variantId: 28136021668 },
    M: { variantId: 27768406917 },
    L: { variantId: 28136021670 },
    XL: { variantId: 28136021672 },
    "2X": { variantId: 27768406931 },
  },
};

export function hasPrintfulVariant(slug: string, size?: string | null) {
  const sizeKey = (size || "DEFAULT").toUpperCase();
  const variant = MERCH_PRINTFUL_VARIANTS[slug]?.[sizeKey];
  return Boolean(variant?.variantId && variant.variantId > 0);
}

export function resolvePrintfulVariantId(slug: string, size?: string | null) {
  const item = getMerchItem(slug);
  if (!item) {
    throw new Error(`Unknown merch item slug "${slug}"`);
  }

  const sizeKey = (size || "DEFAULT").toUpperCase();
  const itemMapping = MERCH_PRINTFUL_VARIANTS[slug];
  const variant = itemMapping?.[sizeKey];

  if (!variant?.variantId || variant.variantId <= 0) {
    const knownKeys = Object.keys(itemMapping || {});
    throw new Error(
      [
        `Missing Printful variant mapping for "${slug}" size "${sizeKey}".`,
        `Set MERCH_PRINTFUL_VARIANTS["${slug}"]["${sizeKey}"].variantId in src/lib/merch-printful.ts.`,
        knownKeys.length
          ? `Known size keys for this slug: ${knownKeys.join(", ")}`
          : "No size keys configured for this slug yet.",
      ].join(" ")
    );
  }

  return variant.variantId;
}
