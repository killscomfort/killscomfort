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

  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-clay/70 bg-desert-sand/50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.25em] text-near-black/55">
          {externalBuy ? "Available on Etsy" : formatPrice(item.priceCents)}
        </p>
        <h3 className="mt-1 text-lg font-medium uppercase text-near-black">{item.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-near-black/60">{item.description}</p>

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
            className="mt-4 flex w-full items-center justify-center rounded-full border border-near-black bg-near-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-bone transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b332b]"
          >
            Buy Now
          </a>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="mt-4 w-full rounded-full border border-near-black bg-near-black py-3 text-sm font-medium uppercase tracking-[0.15em] text-bone transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b332b]"
          >
            {added ? "Added ✓" : "Add to Cart"}
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
        <p className="mt-10 text-center text-sm text-near-black/55">
          Hoodies and shorts go to your cart.{" "}
          <Link href="/checkout" className="underline text-near-black hover:opacity-70">
            Checkout with Stripe
          </Link>
        </p>
      )}
    </>
  );
}
