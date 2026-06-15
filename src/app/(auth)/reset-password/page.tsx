"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      const next = encodeURIComponent("/reset-password");
      router.replace(`/auth/callback?code=${code}&next=${next}`);
      return;
    }

    async function verifySession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(Boolean(user));
      setCheckingSession(false);
    }

    verifySession();
  }, [router, searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm_password") || "");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    router.refresh();
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-bone/60">
        Verifying reset link...
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md border border-dried-blood/30 bg-warm-charcoal/50 p-8 text-center">
          <h1 className="text-display text-2xl uppercase text-bone">
            Link Expired
          </h1>
          <p className="mt-4 text-sm text-bone/70">
            This reset link is invalid or has expired. Request a new one to
            continue.
          </p>
          <Button href="/forgot-password" className="mt-6">
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md border border-white/15 bg-warm-charcoal/50 p-8 text-center">
          <h1 className="text-display text-2xl uppercase text-bone">
            Password Updated
          </h1>
          <p className="mt-4 text-sm text-bone/70">
            Your password has been changed. You can sign in with your new
            password.
          </p>
          <Button href="/login" className="mt-6">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md border border-clay/20 bg-warm-charcoal/50 p-8">
        <h1 className="text-display text-3xl uppercase text-bone">
          New Password
        </h1>
        <p className="mt-2 text-sm text-bone/60">
          Choose a new password for your account.
        </p>

        {error && (
          <p className="mt-4 border border-dried-blood/50 bg-dried-blood/10 px-4 py-3 text-sm text-dried-blood">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            name="password"
            type="password"
            label="New password"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Input
            name="confirm_password"
            type="password"
            label="Confirm password"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Update Password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-bone/60">
          <Link href="/login" className="text-muted-gold hover:text-bone">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-bone/60">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
