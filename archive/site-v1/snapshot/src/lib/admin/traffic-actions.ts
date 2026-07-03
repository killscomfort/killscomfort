"use server";

import { revalidatePath } from "next/cache";
import { getAdminServiceClient, requireAdmin } from "@/lib/admin/auth";

function revalidateTraffic() {
  revalidatePath("/admin/traffic");
}

export async function addExcludedIp(formData: FormData) {
  const authSupabase = await requireAdmin();
  const supabase = await getAdminServiceClient();
  const ip = String(formData.get("ip_address") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const city = String(formData.get("city") || "").trim() || null;
  const region = String(formData.get("region") || "").trim() || null;

  if (!ip || !label) {
    throw new Error("IP address and label are required.");
  }

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  const { error } = await supabase.from("excluded_ips").upsert(
    {
      ip_address: ip,
      label,
      city,
      region,
      created_by: user?.id ?? null,
    },
    { onConflict: "ip_address" }
  );

  if (error) throw new Error(error.message);
  revalidateTraffic();
}

export async function removeExcludedIp(formData: FormData) {
  const supabase = await getAdminServiceClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("excluded_ips").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTraffic();
}
