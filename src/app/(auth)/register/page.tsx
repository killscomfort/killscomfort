"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { SITE } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: form.get("email") as string,
      password: form.get("password") as string,
      options: {
        data: { full_name: form.get("full_name") as string },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md border border-moss-green/40 bg-moss-green/10 p-8 text-center">
          <h1 className="text-display text-2xl uppercase text-bone">
            Check Your Email
          </h1>
          <p className="mt-4 text-bone/70">
            We sent a confirmation link. Verify your email to access your account.
          </p>
          <Button href="/login" className="mt-6">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md border border-clay/20 bg-warm-charcoal/50 p-8">
        <h1 className="text-display text-3xl uppercase text-bone">Join</h1>
        <p className="mt-2 text-sm text-bone/60">
          Create your {SITE.name} account
        </p>

        {error && (
          <p className="mt-4 border border-dried-blood/50 bg-dried-blood/10 px-4 py-3 text-sm text-dried-blood">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input name="full_name" label="Full Name" required />
          <Input name="email" type="email" label="Email" required />
          <Input
            name="password"
            type="password"
            label="Password"
            required
            minLength={6}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-bone/60">
          Already have an account?{" "}
          <Link href="/login" className="text-muted-gold hover:text-bone">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
