import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return supabase;
}

/** Verified admin session + service role client (bypasses RLS for admin reads/writes). */
export async function getAdminServiceClient() {
  await requireAdmin();
  return createServiceClient();
}
