import {
  createClient,
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

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

/** Admin DB client — prefers service role, falls back to the signed-in admin session. */
export async function getAdminClient() {
  const supabase = await requireAdmin();
  if (isServiceRoleConfigured()) {
    return createServiceClient();
  }
  return supabase;
}
