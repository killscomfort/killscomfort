"use client";

import { useState } from "react";
import Image from "next/image";
import { Select } from "@/components/ui/Input";
import { formatPrice, MERCH_ITEMS, type MerchItem } from "@/lib/merch";

function MerchProductCard({ item }: { item: MerchItem }) {
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    if (item.sizes?.length && !size) {
      setError("Select a size");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/merch-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug, size: size || undefined, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          {formatPrice(item.priceCents)}
        </p>
        <h3 className="mt-1 text-lg font-bold uppercase text-bone">{item.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-bone/60">{item.description}</p>

        {item.sizes && (
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

        <button
          type="button"
          onClick={handleBuy}
          disabled={loading}
          className={`mt-4 w-full rounded-xl py-3 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
            loading
              ? "cursor-wait bg-white/5 text-white/40"
              : "bg-muted-gold text-near-black hover:bg-desert-sand hover:shadow-lg hover:shadow-muted-gold/20"
          }`}
        >
          {loading ? "Redirecting…" : "Buy Now"}
        </button>
      </div>
    </article>
  );
}

export function MerchShop() {
  return (
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 lg:gap-x-12">
      {MERCH_ITEMS.map((item) => (
        <MerchProductCard key={item.slug} item={item} />
      ))}
    </div>
  );
}
