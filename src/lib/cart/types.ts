import type { CatalogItem } from "@/lib/catalog";

export type CartLine = {
  slug: string;
  quantity: number;
  size?: string;
};

export type CartItem = CartLine & {
  kind: CatalogItem["kind"];
  name: string;
  priceCents: number;
  description?: string;
  image?: string;
  lineTotalCents: number;
};
