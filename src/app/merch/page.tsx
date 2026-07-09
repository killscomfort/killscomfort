"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MerchProductGallery from "@/components/merch/MerchProductGallery";
import { MERCH_PRODUCTS, type MerchColor, type MerchProduct } from "@/config/merch.config";

function MerchCard({ product }: { product: MerchProduct }) {
  const [color, setColor] = useState<MerchColor>("black");
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#101014] transition hover:border-zinc-600">
      <Link href={`/merch/${product.slug}`} className="block">
        <div className="relative h-80 bg-[#0b0b0d]">
          <MerchProductGallery product={product} color={color} className="h-full w-full" />
        </div>
      </Link>
      <div className="flex items-start justify-between gap-3 p-5">
        <div>
          <Link href={`/merch/${product.slug}`}>
            <h3 className="font-bold uppercase tracking-wide">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-zinc-500">
            ${(product.priceCents / 100).toFixed(2)} · {product.material}
            {product.fit ? ` · ${product.fit}` : ""}
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          {product.colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Preview ${c}`}
              aria-pressed={color === c}
              className={`h-6 w-6 rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                color === c ? "border-zinc-200" : "border-zinc-700"
              } ${c === "black" ? "bg-[#141416]" : "bg-[#f1f0ec]"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MerchPageContent() {
  const params = useSearchParams();
  const orderStatus = params.get("order");

  return (
    <main className="min-h-screen bg-[#0b0b0d] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        {orderStatus === "success" && (
          <div className="mb-8 rounded-xl border border-emerald-800 bg-emerald-950/50 p-4 text-emerald-300">
            Order confirmed. Check your email — production starts now.
          </div>
        )}
        {orderStatus === "canceled" && (
          <div className="mb-8 rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-400">
            Checkout canceled. Your cart is still here when you&apos;re ready.
          </div>
        )}

        <p className="text-[11px] tracking-[0.4em] text-zinc-500">NEW DROP</p>
        <h1 className="mt-2 text-4xl font-extrabold uppercase tracking-wide">
          Kill Comfort. Wear It.
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Real cotton pieces in black and white. Logo printed on demand through Printful.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {MERCH_PRODUCTS.map((p) => (
            <MerchCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MerchPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-6 py-24 text-center text-zinc-500">
          Loading merch…
        </main>
      }
    >
      <MerchPageContent />
    </Suspense>
  );
}
