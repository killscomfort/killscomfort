"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/CartProvider";

export function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
