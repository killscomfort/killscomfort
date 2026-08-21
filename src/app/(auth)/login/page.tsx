"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { SITE } from "@/lib/constants";

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams.get("redirect"));
  const authError = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    authError ? decodeURIComponent(authError) : ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    // Clear academy guest sessions so password login can replace them.
    const {
      data: { user: existing },
    } = await supabase.auth.getUser();
    if (existing?.is_anonymous) {
      await supabase.auth.signOut();
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Hard navigation so middleware sees the new auth cookies (soft push can miss them).
    window.location.assign(redirect);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md border border-clay/20 bg-warm-charcoal/50 p-8">
        <h1 className="text-display text-3xl uppercase text-bone">Sign In</h1>
        <p className="mt-2 text-sm text-bone/60">
          Access your {SITE.name} account
        </p>

        {error && (
          <p className="mt-4 border border-dried-blood/50 bg-dried-blood/10 px-4 py-3 text-sm text-dried-blood">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input name="email" type="email" label="Email" required />
          <div>
            <PasswordInput name="password" label="Password" required />
            <p className="mt-2 text-right text-sm">
              <Link
                href="/forgot-password"
                className="text-bone/55 hover:text-bone"
              >
                Forgot password?
              </Link>
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-bone/60">
          No account?{" "}
          <Link href="/register" className="text-muted-gold hover:text-bone">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-bone/60">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
