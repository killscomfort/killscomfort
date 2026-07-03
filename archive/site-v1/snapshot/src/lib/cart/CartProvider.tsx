"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCatalogItem } from "@/lib/catalog";
import { LOGO_SRC } from "@/lib/constants";
import { isCartMerchItem } from "@/lib/merch";
import type { CartItem, CartLine } from "./types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  ready: boolean;
  addItem: (line: CartLine) => void;
  updateQuantity: (slug: string, size: string | undefined, quantity: number) => void;
  removeItem: (slug: string, size?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "killscomfort-cart";

function lineKey(slug: string, size?: string) {
  return `${slug}::${size ?? ""}`;
}

function hydrateItems(lines: CartLine[]): CartItem[] {
  const items: CartItem[] = [];

  for (const line of lines) {
    const product = getCatalogItem(line.slug);
    if (!product) continue;
    if (product.kind === "merch" && !isCartMerchItem(product)) continue;

    items.push({
      ...line,
      kind: product.kind,
      name: product.name,
      priceCents: product.priceCents,
      description: product.description,
      image: product.kind === "merch" ? product.image : LOGO_SRC,
      lineTotalCents: product.priceCents * line.quantity,
    });
  }

  return items;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored) as CartLine[]);
    } catch {
      setLines([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const addItem = useCallback((line: CartLine) => {
    const product = getCatalogItem(line.slug);
    if (product?.kind === "merch" && !isCartMerchItem(product)) return;

    setLines((current) => {
      const key = lineKey(line.slug, line.size);
      const existing = current.find(
        (item) => lineKey(item.slug, item.size) === key
      );
      if (existing) {
        return current.map((item) =>
          lineKey(item.slug, item.size) === key
            ? { ...item, quantity: item.quantity + line.quantity }
            : item
        );
      }
      return [...current, line];
    });
  }, []);

  const updateQuantity = useCallback(
    (slug: string, size: string | undefined, quantity: number) => {
      setLines((current) =>
        current
          .map((item) =>
            lineKey(item.slug, item.size) === lineKey(slug, size)
              ? { ...item, quantity }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const removeItem = useCallback((slug: string, size?: string) => {
    setLines((current) =>
      current.filter((item) => lineKey(item.slug, item.size) !== lineKey(slug, size))
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const items = useMemo(() => hydrateItems(lines), [lines]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotalCents = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotalCents,
      ready,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotalCents, ready, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
