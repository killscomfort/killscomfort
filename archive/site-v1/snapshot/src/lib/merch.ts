export type MerchItem = {
  slug: string;
  name: string;
  priceCents: number;
  description: string;
  image: string;
  sizes?: string[];
  /** External checkout (e.g. Etsy) — Buy Now instead of Add to Cart */
  buyUrl?: string;
};

export const MERCH_ITEMS: MerchItem[] = [
  {
    slug: "kills-shorts",
    name: "KILLS SHORTS",
    priceCents: 6000,
    description: "Street-ready. Logo across the front. Built for movement.",
    image: "/about/FINALS-2.png",
    sizes: ["32", "34", "36", "38"],
  },
  {
    slug: "diamond-hoodie",
    name: "KillsComfort Diamond Hoodie",
    priceCents: 7000,
    description: "Diamond logo hoodie — heavyweight comfort, movement energy.",
    image: "/merch/hoodie.png",
    sizes: ["S", "M", "L", "XL", "2X"],
  },
];

export function getMerchItem(slug: string) {
  return MERCH_ITEMS.find((item) => item.slug === slug);
}

export function isCartMerchItem(item: MerchItem) {
  return !item.buyUrl;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
