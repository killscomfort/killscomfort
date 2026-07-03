"use client";

import { CartProvider } from "@/lib/cart/CartProvider";
import { TransitionProvider } from "@/components/transitions/TransitionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <CartProvider>{children}</CartProvider>
    </TransitionProvider>
  );
}
