export type CartLine = {
  slug: string;
  quantity: number;
  size?: string;
};

export type CartItem = CartLine & {
  name: string;
  priceCents: number;
  image: string;
  lineTotalCents: number;
};
