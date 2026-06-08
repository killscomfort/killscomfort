import { LOGO_SRC } from "@/lib/constants";

export type MerchItem = {
  slug: string;
  name: string;
  priceCents: number;
  description: string;
  image: string;
  sizes?: string[];
};

export const MERCH_ITEMS: MerchItem[] = [
  {
    slug: "kills-shorts",
    name: "KILLS SHORTS",
    priceCents: 6000,
    description: "Street-ready. Logo across the front. Built for movement.",
    image: "/about/FINALS-14.png",
    sizes: ["32", "34", "36", "38"],
  },
  {
    slug: "diamond-hoodie",
    name: "KillsComfort Diamond Hoodie",
    priceCents: 7000,
    description: "Diamond logo hoodie — heavyweight comfort, movement energy.",
    image: "/merch/killscomfort-hoodie.jpg",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "die-cut-stickers",
    name: '"KillsComfort" Die Cut Stickers',
    priceCents: 100,
    description: "Represent with your very own sticky sticker :)",
    image: LOGO_SRC,
  },
];

export function getMerchItem(slug: string) {
  return MERCH_ITEMS.find((item) => item.slug === slug);
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
