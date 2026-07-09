/**
 * Fine Shyts — low-rise cotton boyshort landing page
 * Checkout routes to Shopify (Art of Where app). Swap CHECKOUT_URL when live.
 */

export type ShortsColor = "black" | "white";

export const CHECKOUT_URL =
  "https://YOUR-SHOP.myshopify.com/products/killscomfort-fine-shyts";

export const VARIANT_CHECKOUT_URLS: Partial<Record<string, string>> = {
  // "black-M": "https://YOUR-SHOP.myshopify.com/cart/1234567890:1",
};

export function checkoutUrlFor(color: ShortsColor, size: string): string {
  return (
    VARIANT_CHECKOUT_URLS[`${color}-${size}`] ??
    `${CHECKOUT_URL}?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`
  );
}

export const SHORTS = {
  title: "Fine Shyts",
  style: "Low-Rise Cotton Boyshort",
  priceLabel: "$44.44",
  colors: ["black", "white"] as ShortsColor[],
  sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  highlights: [
    "100% cotton",
    "Low-rise waist",
    "Full back coverage",
    "Chrome logo on back",
    "Made on demand via Art of Where",
  ],
  description: [
    "Low-rise cotton boyshort — sourcing board pick #1. Built for movement, lounging, and pulling up with a little extra confidence.",
    "Each pair is printed when you order. Nothing sits in a warehouse.",
  ],
  notes: ["Made on demand", "Ships directly to you"],
  gallery: {
    black: [
      "/merch/mockups/booty-shorts-black-back.png",
      "/merch/mockups/booty-shorts-black-front.png",
    ],
    white: ["/merch/mockups/booty-shorts-black-back.png"],
  } as Record<ShortsColor, string[]>,
  use3DViewer: false,
};
