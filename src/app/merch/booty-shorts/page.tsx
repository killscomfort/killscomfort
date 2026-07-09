"use client";

/**
 * /merch/booty-shorts — Fine Shyts product landing.
 * Buy Now → Shopify (Art of Where). Set CHECKOUT_URL in booty-shorts.config.ts.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SHORTS,
  checkoutUrlFor,
  type ShortsColor,
} from "@/config/booty-shorts.config";

export default function BootyShortsPage() {
  const [color, setColor] = useState<ShortsColor>("black");
  const [size, setSize] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);

  const buyHref = useMemo(
    () => (size ? checkoutUrlFor(color, size) : null),
    [color, size]
  );

  function onBuyAttempt(e: React.MouseEvent) {
    if (!buyHref) {
      e.preventDefault();
      setNudge(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const images = SHORTS.gallery[color];

  return (
    <main className="min-h-screen bg-[#0b0b0d] pb-28 text-zinc-100 md:pb-0">
      <div className="mx-auto max-w-5xl px-4 pt-8 md:px-6 md:pt-14 lg:grid lg:grid-cols-2 lg:gap-12">
        <section aria-label="Product gallery">
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="h-[380px] w-[85vw] max-w-[440px] shrink-0 snap-center overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0b0d] md:h-[440px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${SHORTS.title} — ${color}, view ${i + 1}`}
                  className="h-full w-full object-contain"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-[9px] tracking-[0.3em] text-zinc-600 lg:hidden">
            SWIPE FOR MORE
          </p>
        </section>

        <section className="mt-8 lg:mt-0">
          <Link href="/merch" className="text-[10px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400">
            ← ALL MERCH
          </Link>
          <p className="mt-4 text-[10px] tracking-[0.4em] text-zinc-500">KILLSCOMFORT / MERCH</p>
          <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-wide md:text-3xl">
            {SHORTS.title}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">{SHORTS.style}</p>
          <p className="mt-3 text-2xl font-semibold">{SHORTS.priceLabel}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {SHORTS.notes.map((n) => (
              <span
                key={n}
                className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400"
              >
                {n}
              </span>
            ))}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-zinc-400">
            {SHORTS.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-zinc-600">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <p className="mb-2 text-[10px] tracking-[0.25em] text-zinc-500">
              COLOR — <span className="text-zinc-300">{color.toUpperCase()}</span>
            </p>
            <div className="flex gap-3">
              {SHORTS.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-pressed={color === c}
                  aria-label={c}
                  className={`h-11 w-11 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                    color === c ? "scale-110 border-zinc-200" : "border-zinc-700"
                  } ${c === "black" ? "bg-[#141416]" : "bg-[#f1f0ec]"}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6" id="size-picker">
            <p className="mb-2 text-[10px] tracking-[0.25em] text-zinc-500">SIZE</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SHORTS.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setNudge(false);
                  }}
                  aria-pressed={size === s}
                  className={`rounded-lg border py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 ${
                    size === s
                      ? "border-zinc-200 bg-zinc-100 font-bold text-zinc-900"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {nudge && <p className="mt-2 text-xs text-red-400">Pick a size to continue.</p>}
          </div>

          <div className="mt-8 space-y-4 border-t border-zinc-800 pt-6 text-[15px] leading-relaxed text-zinc-300">
            {SHORTS.description.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <a
            href={buyHref ?? "#size-picker"}
            onClick={onBuyAttempt}
            target={buyHref ? "_blank" : undefined}
            rel={buyHref ? "noopener noreferrer" : undefined}
            className="mt-8 hidden rounded-xl bg-zinc-100 px-10 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white md:inline-block"
          >
            Buy now
          </a>
          <p className="mt-3 hidden text-xs text-zinc-500 md:block">
            Checkout opens in our shop. Printed when you order — nothing sits in a warehouse.
          </p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">{SHORTS.priceLabel}</p>
            <p className="text-[10px] tracking-[0.2em] text-zinc-500">
              {color.toUpperCase()}
              {size ? ` / ${size}` : " — PICK A SIZE"}
            </p>
          </div>
          <a
            href={buyHref ?? "#size-picker"}
            onClick={onBuyAttempt}
            target={buyHref ? "_blank" : undefined}
            rel={buyHref ? "noopener noreferrer" : undefined}
            className="rounded-xl bg-zinc-100 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-zinc-900"
          >
            Buy now
          </a>
        </div>
      </div>
    </main>
  );
}
