"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useCart } from "@/lib/cart/CartProvider";
import { formatPrice, type MerchItem } from "@/lib/merch";

export function MerchCard({ item }: { item: MerchItem }) {
  const { addItem } = useCart();
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  function handleAdd() {
    if (item.sizes?.length && !size) {
      setError("Select a size");
      return;
    }
    setError("");
    addItem({ slug: item.slug, quantity: 1, size: size || undefined });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden bg-warm-charcoal">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            item.image.endsWith(".png") && item.name.includes("Sticker")
              ? "object-contain p-12"
              : ""
          }`}
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-widest text-muted-gold">
          {formatPrice(item.priceCents)}
        </p>
        <h3 className="mt-1 text-lg uppercase text-bone">{item.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-bone/60">{item.description}</p>

        {item.sizes && (
          <div className="mt-4">
            <Select
              label="Size"
              options={item.sizes}
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                setError("");
              }}
              error={error}
            />
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={handleAdd}
        >
          {added ? "Added to Cart" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
