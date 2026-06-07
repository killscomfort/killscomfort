import { LOGO_SRC } from "@/lib/constants";

export type MerchItem = {
  name: string;
  price: string;
  description: string;
  image: string;
  shopUrl: string;
  actionLabel: string;
  sizes?: string[];
};

export const MERCH_ITEMS: MerchItem[] = [
  {
    name: "KILLS SHORTS",
    price: "$60",
    description: "Street-ready. Logo across the front. Built for movement.",
    image: "/about/FINALS-14.png",
    shopUrl: "https://www.killscomfort.com/store/p/kill-shorts",
    actionLabel: "Add to cart",
    sizes: ["32", "34", "36", "38"],
  },
  {
    name: "KillsComfort Diamond Hoodie",
    price: "$70",
    description: "Diamond logo hoodie — available through Etsy.",
    image: "/merch/killscomfort-hoodie.jpg",
    shopUrl:
      "https://www.etsy.com/listing/4401287030/killscomfort-diamond-hoodie",
    actionLabel: "GIMME HOODIE!",
  },
  {
    name: '"KillsComfort" Die Cut Stickers',
    price: "$1",
    description: "Represent with your very own sticky sticker :)",
    image: LOGO_SRC,
    shopUrl:
      "https://www.killscomfort.com/store/p/killscomfort-die-cut-stickers",
    actionLabel: "GIMME MY STICKY!",
  },
];
