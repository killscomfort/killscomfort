"use client";

import { CartProvider } from "@/lib/cart/CartProvider";
import { PortalTransitProvider } from "@/components/portal/PortalTransitProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PortalTransitProvider>
      <CartProvider>{children}</CartProvider>
    </PortalTransitProvider>
  );
}
