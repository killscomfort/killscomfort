"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/callback-url";
import { SITE } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const address = String(form.get("email") || "").trim();
    setEmail(address);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      address,
      {
        redirectTo: getAuthCallbackUrl("/reset-password"),
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md border border-white/15 bg-warm-charcoal/50 p-8 text-center">
          <h1 className="text-display text-2xl uppercase text-bone">
            Check Your Email
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-bone/70">
            If an account exists for{" "}
            <span className="text-bone">{email}</span>, we sent a password
            reset link. Open it to choose a new password.
          </p>
          <p className="mt-3 text-xs text-bone/45">
            The link expires after a short time. Check spam if you do not see it.
          </p>
          <Button href="/login" className="mt-6">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md border border-clay/20 bg-warm-charcoal/50 p-8">
        <h1 className="text-display text-3xl uppercase text-bone">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-bone/60">
          Enter your {SITE.name} account email and we will send a reset link.
        </p>

        {error && (
          <p className="mt-4 border border-dried-blood/50 bg-dried-blood/10 px-4 py-3 text-sm text-dried-blood">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input name="email" type="email" label="Email" required autoComplete="email" />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-bone/60">
          Remember your password?{" "}
          <Link href="/login" className="text-muted-gold hover:text-bone">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
