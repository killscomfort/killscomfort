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
  // TODO(Printful IDs): replace 0 with real variant IDs from Printful product catalog.
  // Shorts sizes from `src/lib/merch.ts`
  "kills-shorts": {
    "32": { variantId: 0 },
    "34": { variantId: 0 },
    "36": { variantId: 0 },
    "38": { variantId: 0 },
  },
  // Hoodie sizes from `src/lib/merch.ts`
  "diamond-hoodie": {
    S: { variantId: 0 },
    M: { variantId: 0 },
    L: { variantId: 0 },
    XL: { variantId: 0 },
  },
  // Sticker has no size selector; use DEFAULT
  "die-cut-stickers": {
    DEFAULT: { variantId: 0 },
  },
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
