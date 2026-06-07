"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    email: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, bio, email")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          email: data.email || user.email || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setMessage(error ? error.message : "Profile updated.");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="pt-32 text-center text-bone/50">Loading...</div>
    );
  }

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-md">
          <h1 className="text-display text-3xl uppercase text-bone">
            Settings
          </h1>

          {message && (
            <p className="mt-4 text-sm text-muted-gold">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Input
              label="Email"
              value={profile.email}
              disabled
              className="opacity-60"
            />
            <Input
              label="Full Name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              required
            />
            <Textarea
              label="Bio"
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
              maxLength={500}
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
