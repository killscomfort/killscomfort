"use client";

import { useState } from "react";
import Image from "next/image";

const PRESET_AMOUNTS = [5, 10, 25, 50];

const GALLERY_IMAGES = [
  { src: "/about/FINALS-2.png", alt: "Event photo" },
  { src: "/about/FINALS-5.png", alt: "Event photo" },
  { src: "/about/FINALS-10.png", alt: "Event photo" },
];

type DonationPurpose = "rollout" | "general";

export function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [purpose, setPurpose] = useState<DonationPurpose>("rollout");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAmount = isCustom ? parseFloat(customAmount) : selectedAmount;
  const isValid = activeAmount != null && activeAmount > 0;

  function handlePresetClick(amount: number) {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
    setError(null);
  }

  function handleCustomFocus() {
    setIsCustom(true);
    setSelectedAmount(null);
    setError(null);
  }

  async function handleDonate() {
    if (!isValid || !activeAmount) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(activeAmount * 100),
          purpose,
        }),
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

  const purposeLabels: Record<DonationPurpose, { title: string; desc: string }> =
    {
      rollout: {
        title: "Rollout Studio App",
        desc: "Fund the app that puts creative tools in every artist's hands.",
      },
      general: {
        title: "General Support",
        desc: "Keep the music going — studio time, releases, and events.",
      },
    };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f0ece4]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/about/FINALS-60.png"
            alt="KillsComfort live"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/40 via-[#1a1a1a]/60 to-[#1a1a1a]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 pt-32 pb-20 text-center">
          <div className="mx-auto mb-8 w-48 sm:w-64">
            <Image
              src="/killspng dropshadow.png"
              alt="KillsComfort"
              width={600}
              height={200}
              className="h-auto w-full"
              priority
            />
          </div>

          <h1 className="text-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            <span className="text-[#a0937d]">Fuel</span> the Movement
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[#8a8a8a] sm:text-lg">
            Your support funds the Rollout Studio App and keeps KillsComfort
            pushing past every comfort zone. Every dollar goes directly into the
            music.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-lg px-6 pb-20">
        <div
          className="rounded-2xl border border-white/[0.06] p-8 sm:p-10"
          style={{
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
          }}
        >
          <div className="mb-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#8a8a8a]">
              I&rsquo;m supporting
            </p>
            <div className="flex gap-3">
              {(["rollout", "general"] as DonationPurpose[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    purpose === p
                      ? "border-[#c19a6b] bg-[#c19a6b]/10 text-[#c19a6b]"
                      : "border-white/10 text-[#8a8a8a] hover:border-white/20 hover:text-[#f0ece4]"
                  }`}
                >
                  {purposeLabels[p].title}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#8a8a8a]/80">
              {purposeLabels[purpose].desc}
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#8a8a8a]">
              Choose an amount
            </p>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetClick(amount)}
                  className={`rounded-lg border py-3 text-center text-base font-semibold transition-all duration-200 ${
                    selectedAmount === amount && !isCustom
                      ? "border-[#b8a88a] bg-[#b8a88a]/10 text-[#b8a88a]"
                      : "border-white/10 text-[#8a8a8a] hover:border-white/20 hover:text-[#f0ece4]"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#8a8a8a]">
              Or enter your own
            </p>
            <div
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 transition-all duration-200 ${
                isCustom ? "border-[#b8a88a] bg-[#b8a88a]/5" : "border-white/10"
              }`}
            >
              <span
                className={`text-lg font-semibold ${
                  isCustom ? "text-[#b8a88a]" : "text-[#8a8a8a]"
                }`}
              >
                $
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0.00"
                value={customAmount}
                onFocus={handleCustomFocus}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-transparent text-lg font-semibold text-[#f0ece4] outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-dried-blood">{error}</p>
          )}

          <button
            type="button"
            onClick={handleDonate}
            disabled={!isValid || loading}
            className={`group relative w-full overflow-hidden rounded-xl py-4 text-base font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
              isValid && !loading
                ? "bg-muted-gold text-near-black hover:bg-desert-sand hover:shadow-lg hover:shadow-muted-gold/20"
                : "cursor-not-allowed bg-white/5 text-white/20"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Redirecting…
              </span>
            ) : isValid ? (
              `Donate $${activeAmount?.toFixed(2)}`
            ) : (
              "Select an amount"
            )}
          </button>

          <div className="mt-5 flex flex-col items-center gap-3">
            <p className="text-xs text-[#8a8a8a]/50">
              Apple Pay · Google Pay · Cards · Powered by Stripe
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#8a8a8a]">
            Transparency
          </p>
          <h2 className="text-display text-2xl font-bold sm:text-3xl">
            <span className="text-[#a0937d]">Where</span> It Goes
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              label: "Production",
              desc: "Studio sessions, mixing, mastering — the sound you hear.",
            },
            {
              label: "Rollout App",
              desc: "Development, hosting, and tools for the creator community.",
            },
            {
              label: "Events",
              desc: "Live sets, pop-ups, and experiences that connect people.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] px-6 py-5"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#b8a88a]">
                {item.label}
              </h3>
              <p className="text-sm leading-relaxed text-[#8a8a8a]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-3 gap-3 overflow-hidden rounded-xl">
          {GALLERY_IMAGES.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-[#1a1a1a]/30" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-[#8a8a8a]/50">
          100% goes to the music. No middlemen.
        </p>
      </section>
    </div>
  );
}
