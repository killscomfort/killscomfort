/**
 * KillsComfort Merch Expansion — central config
 * ------------------------------------------------
 * Everything tunable lives here: pricing, sizes, colors, and the
 * Printful sync-variant mapping that wires dropshipping.
 *
 * PRINTFUL_SYNC_VARIANTS is auto-filled by `npm run printful:sync`
 * after you create the products once in the Printful dashboard.
 * Until then the checkout still works — orders just won't auto-forward
 * to Printful (the Stripe webhook logs a warning instead).
 */

export type MerchColor = "black" | "white";
export type MerchSlug = "booty-shorts" | "crop-top" | "sweatpants";

export interface MerchVariant {
  sku: string; // e.g. KC-SHORTS-BLK-M
  color: MerchColor;
  size: string;
}

export interface MerchProduct {
  slug: MerchSlug;
  name: string;
  tagline: string;
  material: string;
  /** Garment fit / style for product page + Printful sourcing */
  fit?: string;
  /** Sourcing style name (e.g. Printful blank to pick) */
  style?: string;
  highlights?: string[];
  priceCents: number; // charged to customer, USD
  logoPlacement: "front" | "back";
  sizes: string[];
  colors: MerchColor[];
  /** Printful / product photos per color — preferred over 3D */
  gallery?: Partial<Record<MerchColor, string[]>>;
  /** Approximate Printful base cost, for your margin math only */
  estBaseCostCents: number;
}

export const MERCH_PRODUCTS: MerchProduct[] = [
  {
    slug: "booty-shorts",
    name: "Fine Shyts",
    tagline: "Low-rise cotton boyshort. Chrome logo across the back.",
    material: "100% cotton",
    fit: "Low rise",
    style: "Low-Rise Cotton Boyshort",
    highlights: [
      "100% cotton",
      "Low-rise waist",
      "Full back coverage",
      "Everyday comfort",
      "DTG print ready",
    ],
    priceCents: 4444,
    logoPlacement: "back",
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: ["black", "white"],
    gallery: {
      black: [
        "/merch/mockups/booty-shorts-black-back.png",
        "/merch/mockups/booty-shorts-black-front.png",
      ],
      white: ["/merch/mockups/booty-shorts-black-back.png"],
    },
    estBaseCostCents: 1900,
  },
  {
    slug: "crop-top",
    name: "KillsComfort Crop Top",
    tagline: "Chrome on chest. Built for the front row.",
    material: "Cotton blend",
    priceCents: 3200,
    logoPlacement: "front",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["black", "white"],
    estBaseCostCents: 1400,
  },
  {
    slug: "sweatpants",
    name: "KillsComfort Sweatpants",
    tagline: "Logo up front. For the after-hours and the day after.",
    material: "Cotton fleece blend",
    priceCents: 5400,
    logoPlacement: "front",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["black", "white"],
    estBaseCostCents: 2800,
  },
];

export function skuFor(slug: MerchSlug, color: MerchColor, size: string): string {
  const code: Record<MerchSlug, string> = {
    "booty-shorts": "SHORTS",
    "crop-top": "CROP",
    sweatpants: "SWEATS",
  };
  return `KC-${code[slug]}-${color === "black" ? "BLK" : "WHT"}-${size}`;
}

export function productBySlug(slug: string): MerchProduct | undefined {
  return MERCH_PRODUCTS.find((p) => p.slug === slug);
}

/** Flat shipping for v1. Swap for Printful live rates later (see README). */
export const SHIPPING_OPTIONS = [
  { label: "Standard (5–8 days)", amountCents: 599 },
  { label: "Express (2–4 days)", amountCents: 1499 },
];

// ---------------------------------------------------------------------------
// PRINTFUL SYNC VARIANT MAP — filled by scripts/printful-sync.ts
// Maps our SKU -> Printful sync_variant_id
// ---------------------------------------------------------------------------
export const PRINTFUL_SYNC_VARIANTS: Record<string, number> = {
  // BEGIN GENERATED — do not edit by hand, run: npm run printful:sync
  // "KC-SHORTS-BLK-M": 123456789,
  // END GENERATED
};
