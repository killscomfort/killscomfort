"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

interface NewsletterUnsubscribeFormProps {
  token: string;
  email: string;
  alreadyUnsubscribed: boolean;
}

export function NewsletterUnsubscribeForm({
  token,
  email,
  alreadyUnsubscribed: initialUnsubscribed,
}: NewsletterUnsubscribeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unsubscribed, setUnsubscribed] = useState(initialUnsubscribed);

  async function handleUnsubscribe() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Could not unsubscribe. Please try again.");
        return;
      }

      setUnsubscribed(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (unsubscribed) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-2xl text-bone sm:text-3xl">You&apos;re unsubscribed.</p>
        <p className="mt-4 text-sm leading-relaxed text-bone/65 sm:text-base">
          <span className="text-bone">{email}</span> won&apos;t receive newsletter
          emails from {SITE.name} anymore.
        </p>
        <p className="mt-6 text-sm text-bone/50">
          Changed your mind? You can always rejoin from the footer on{" "}
          <Link href="/" className="text-bone underline hover:text-muted-gold">
            killscomfort.com
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <p className="text-2xl text-bone sm:text-3xl">Unsubscribe from the list</p>
      <p className="mt-4 text-sm leading-relaxed text-bone/65 sm:text-base">
        Stop newsletter emails to{" "}
        <span className="text-bone">{email}</span>. You&apos;ll still be part of
        the movement — just not on this mailing list.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button type="button" onClick={handleUnsubscribe} disabled={loading}>
          {loading ? "Unsubscribing..." : "Confirm unsubscribe"}
        </Button>
        <Button href="/" variant="secondary">
          Keep me subscribed
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-dried-blood">{error}</p>}
    </div>
  );
}
