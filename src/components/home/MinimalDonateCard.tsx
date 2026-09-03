"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

const PRESET_AMOUNTS = [10, 25, 50, 100];

type DonationPurpose = "rollout" | "general";

const PURPOSE_COPY: Record<DonationPurpose, { label: string; detail: string }> = {
  rollout: {
    label: "Rollout app",
    detail: "Support the app and tools behind the wider creative movement.",
  },
  general: {
    label: "General support",
    detail: "Fund music releases, live sets, visuals, and future drops.",
  },
};

export function MinimalDonateCard() {
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [purpose, setPurpose] = useState<DonationPurpose>("rollout");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amount = useMemo(() => {
    if (customAmount.trim()) {
      return Number(customAmount);
    }
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const validAmount = Number.isFinite(amount) && amount > 0;

  async function handleDonate() {
    if (!validAmount) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel p-6 sm:p-8">
      <div className="flex flex-wrap gap-3">
        {(["rollout", "general"] as DonationPurpose[]).map((option) => {
          const active = option === purpose;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setPurpose(option)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                active
                  ? "border-near-black bg-near-black text-bone"
                  : "border-clay bg-bone/70 text-near-black/70 hover:border-near-black"
              }`}
            >
              {PURPOSE_COPY[option].label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-near-black/60">
        {PURPOSE_COPY[purpose].detail}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESET_AMOUNTS.map((preset) => {
          const active = !customAmount && selectedAmount === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSelectedAmount(preset);
                setCustomAmount("");
              }}
              className={`rounded-2xl border px-4 py-4 text-base font-medium transition-colors ${
                active
                  ? "border-near-black bg-desert-sand text-near-black"
                  : "border-clay/80 bg-bone/70 text-near-black/75 hover:border-near-black/50"
              }`}
            >
              ${preset}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-clay/80 bg-bone/70 px-4 py-3">
        <label
          htmlFor="donation-amount"
          className="text-xs uppercase tracking-[0.2em] text-near-black/45"
        >
          Custom amount
        </label>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-lg text-near-black/60">$</span>
          <input
            id="donation-amount"
            type="number"
            min="1"
            step="any"
            inputMode="decimal"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-lg text-near-black outline-none placeholder:text-mid-gray"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-dried-blood">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-near-black/45">
          Stripe checkout · Apple Pay · Google Pay · Cards
        </p>
        <Button type="button" onClick={handleDonate} disabled={!validAmount || loading}>
          {loading ? "Redirecting..." : `Donate $${amount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
