"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/checkout"
      className="relative text-near-black/70 transition-colors hover:text-near-black"
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
    >
      <ShoppingBag size={22} />
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-near-black px-1 text-[10px] font-medium text-bone">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
