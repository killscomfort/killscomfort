import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-display text-4xl uppercase text-bone">
            Dashboard
          </h1>
          <p className="mt-2 text-bone/60">
            Welcome back, {profile?.full_name || user.email}
          </p>

          <div className="mt-12 border border-clay/20 bg-warm-charcoal/50 p-8">
            <h2 className="text-display text-2xl uppercase text-muted-gold">
              More Coming Soon
            </h2>
            <p className="mt-4 text-bone/70 leading-relaxed">
              Exclusive content, community features, and member perks are on the
              way. This is the foundation — your account is ready for what&apos;s
              next.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/dashboard/settings" variant="outline">
              Account Settings
            </Button>
            {profile?.role === "admin" && (
              <Button href="/admin">Admin Dashboard</Button>
            )}
          </div>

          <form
            action="/api/auth/signout"
            method="POST"
            className="mt-8"
          >
            <button
              type="submit"
              className="text-sm text-bone/50 hover:text-dried-blood transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
