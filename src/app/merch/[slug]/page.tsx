"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MerchProductGallery from "@/components/merch/MerchProductGallery";
import { productBySlug, type MerchColor } from "@/config/merch.config";

export default function MerchProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const product = useMemo(() => productBySlug(slug), [slug]);

  const [color, setColor] = useState<MerchColor>("black");
  const [size, setSize] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center text-zinc-400">
        <p>That piece doesn&apos;t exist.</p>
        <button onClick={() => router.push("/merch")} className="mt-4 underline">
          Back to the catalogue
        </button>
      </main>
    );
  }

  async function buyNow() {
    if (!size) {
      setError("Pick a size first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/merch/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ slug: product!.slug, color, size, quantity: 1 }] }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-zinc-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0b0d]">
          <MerchProductGallery
            product={product}
            color={color}
            className="h-[420px] w-full lg:h-[560px]"
            priority
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[11px] tracking-[0.4em] text-zinc-500">KILLSCOMFORT / MERCH</p>
          <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-wide">{product.name}</h1>
          <p className="mt-2 text-zinc-400">{product.tagline}</p>
          <p className="mt-4 text-2xl font-semibold">${(product.priceCents / 100).toFixed(2)}</p>

          {product.style && (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">{product.style}</p>
          )}

          {product.highlights && product.highlights.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm text-zinc-400">
              {product.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-zinc-600">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <p className="mb-2 text-xs tracking-[0.25em] text-zinc-500">COLOR</p>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  className={`h-10 w-10 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                    color === c ? "border-zinc-200 scale-110" : "border-zinc-700"
                  } ${c === "black" ? "bg-[#141416]" : "bg-[#f1f0ec]"}`}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs tracking-[0.25em] text-zinc-500">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`min-w-[52px] rounded-lg border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                    size === s
                      ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            {product.material}
            {product.fit ? ` · ${product.fit}` : ""} · Logo on {product.logoPlacement} · printed on
            demand, ships in 2–5 business days
          </p>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            onClick={buyNow}
            disabled={busy}
            className="mt-8 rounded-xl bg-zinc-100 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white disabled:opacity-50"
          >
            {busy ? "Opening checkout…" : "Buy now"}
          </button>
        </div>
      </div>
    </main>
  );
}
