"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type NewsletterSignupSource = "home" | "footer";

type Props = {
  source: NewsletterSignupSource;
  /** Tighter layout for footer / secondary placements */
  compact?: boolean;
};

export function NewsletterSignup({ source, compact = false }: Props) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const data = {
      email: form.get("email") as string,
      source,
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
    };

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setError(result.message || "Something went wrong. Try again.");
        }
        return;
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className={cn(
          "rounded-[2rem] border border-clay/70 bg-bone/75 text-center",
          compact ? "px-5 py-6 sm:px-8 sm:py-8" : "px-6 py-8 sm:px-10 sm:py-10"
        )}
      >
        <p className="text-lg text-near-black sm:text-xl">You&apos;re in, Comfort Killer.</p>
        <p className="mt-2 text-sm text-near-black/60 sm:text-base">
          Music, Miami events, and ways to keep killing your comforts — straight to your inbox.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[2rem] border border-clay/70 bg-bone/75",
        compact ? "px-5 py-6 sm:px-8 sm:py-8" : "px-6 py-8 sm:px-10 sm:py-10"
      )}
    >
      {!compact && (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-near-black/45">
            Comfort Killers Newsletter
          </p>
          <h2 className="mt-3 text-2xl text-near-black sm:text-3xl">
            Kill the comfort. Keep the current.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-near-black/65 sm:text-base">
            New music, Miami events, and mindset — straight to your inbox. No spam,
            just the Comfort Killers dispatch.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={cn(
          "mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start",
          compact ? "" : "mt-6 sm:mt-8"
        )}
      >
        <div className="min-w-0 flex-1">
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            error={fieldErrors.email}
            aria-label="Email address"
          />
        </div>
        <Button
          type="submit"
          size="md"
          disabled={loading}
          className="shrink-0 sm:mt-0 sm:h-[3.125rem]"
        >
          {loading ? "Joining..." : "Subscribe"}
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-center text-sm text-dried-blood">{error}</p>
      )}
    </div>
  );
}
