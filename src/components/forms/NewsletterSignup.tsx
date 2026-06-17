"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NewsletterSignup() {
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
      source: "footer",
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
      <div className="rounded-sm border border-clay/20 bg-near-black/40 px-6 py-8 text-center sm:px-10 sm:py-10">
        <p className="text-lg text-bone sm:text-xl">You&apos;re on the list.</p>
        <p className="mt-2 text-sm text-bone/60 sm:text-base">
          Keep killing your comforts — we&apos;ll be in touch when there&apos;s
          something worth sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-clay/20 bg-near-black/40 px-6 py-8 sm:px-10 sm:py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-gold">
          Newsletter
        </p>
        <h2 className="mt-3 text-2xl font-normal normal-case tracking-normal text-bone sm:text-3xl">
          Find new ways to kill your comforts
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-bone/65 sm:text-base">
          New music, shows, and mindset — straight to your inbox. No noise, just
          growth.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:mt-8 sm:flex-row sm:items-start"
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
          {loading ? "Joining..." : "Join the list"}
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-center text-sm text-dried-blood">{error}</p>
      )}
    </div>
  );
}
