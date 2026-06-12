"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Select } from "@/components/ui/Input";
import { useCart } from "@/lib/cart/CartProvider";
import {
  formatPrice,
  isCartMerchItem,
  MERCH_ITEMS,
  type MerchItem,
} from "@/lib/merch";

function MerchProductCard({ item }: { item: MerchItem }) {
  const { addItem } = useCart();
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const externalBuy = Boolean(item.buyUrl);

  function handleAdd() {
    if (item.sizes?.length && !size) {
      setError("Select a size");
      return;
    }

    setError(null);
    addItem({ slug: item.slug, quantity: 1, size: size || undefined });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const isSticker = item.slug === "die-cut-stickers";

  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-warm-charcoal">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            isSticker ? "object-contain p-10" : ""
          }`}
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-gold">
          {externalBuy ? "Available on Etsy" : formatPrice(item.priceCents)}
        </p>
        <h3 className="mt-1 text-lg font-bold uppercase text-bone">{item.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-bone/60">{item.description}</p>

        {!externalBuy && item.sizes && (
          <div className="mt-4">
            <Select
              label="Size"
              options={item.sizes}
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                setError(null);
              }}
              error={error === "Select a size" ? error : undefined}
            />
          </div>
        )}

        {error && error !== "Select a size" && (
          <p className="mt-3 text-sm text-dried-blood">{error}</p>
        )}

        {externalBuy ? (
          <a
            href={item.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-muted-gold py-3 text-sm font-bold uppercase tracking-[0.15em] text-near-black transition-all duration-300 hover:bg-desert-sand hover:shadow-lg hover:shadow-muted-gold/20"
          >
            Buy Now
          </a>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="mt-4 w-full rounded-xl bg-muted-gold py-3 text-sm font-bold uppercase tracking-[0.15em] text-near-black transition-all duration-300 hover:bg-desert-sand hover:shadow-lg hover:shadow-muted-gold/20"
          >
            {added ? "Added to Cart" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
}

export function MerchShop() {
  const hasCartItems = MERCH_ITEMS.some(isCartMerchItem);

  return (
    <>
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 lg:gap-x-12">
        {MERCH_ITEMS.map((item) => (
          <MerchProductCard key={item.slug} item={item} />
        ))}
      </div>

      {hasCartItems && (
        <p className="mt-10 text-center text-sm text-bone/50">
          Shorts and stickers go to your cart.{" "}
          <Link href="/checkout" className="text-muted-gold hover:text-bone">
            Checkout with Stripe
          </Link>
        </p>
      )}
    </>
  );
}
