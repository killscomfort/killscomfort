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
          "rounded-sm border border-clay/20 bg-near-black/40 text-center",
          compact ? "px-5 py-6 sm:px-8 sm:py-8" : "px-6 py-8 sm:px-10 sm:py-10"
        )}
      >
        <p className="text-lg text-bone sm:text-xl">You&apos;re in Comfort Killers.</p>
        <p className="mt-2 text-sm text-bone/60 sm:text-base">
          Welcome to the Comfort Killers Newsletter — we&apos;ll send music, Miami
          events, and ways to keep killing your comforts. No noise.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-sm border border-clay/20 bg-near-black/40",
        compact ? "px-5 py-6 sm:px-8 sm:py-8" : "px-6 py-8 sm:px-10 sm:py-10"
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-gold">
          Comfort Killers Newsletter
        </p>
        <h2
          className={cn(
            "mt-3 font-normal normal-case tracking-normal text-bone",
            compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          )}
        >
          Find new ways to kill your comforts
        </h2>
        <p
          className={cn(
            "mt-3 leading-relaxed text-bone/65",
            compact ? "text-sm" : "text-sm sm:text-base"
          )}
        >
          New music, Miami events, and mindset — straight to your inbox. No spam,
          just the Comfort Killers dispatch.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-start",
          compact ? "mt-5 sm:mt-6" : "mt-6 sm:mt-8"
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
            className="bg-near-black/60"
          />
        </div>
        <Button
          type="submit"
          size="md"
          disabled={loading}
          className="shrink-0 sm:mt-0 sm:h-[3.125rem]"
        >
          {loading ? "Joining..." : "Join Comfort Killers"}
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-center text-sm text-dried-blood">{error}</p>
      )}
    </div>
  );
}
