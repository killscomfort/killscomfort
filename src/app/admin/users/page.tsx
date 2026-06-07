import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const profiles = (users || []) as Profile[];

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Registered accounts and role management."
      />

      <div className="overflow-x-auto border border-clay/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-clay/20 bg-warm-charcoal/80 text-left text-bone/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-bone/50">
                  No users yet.
                </td>
              </tr>
            ) : (
              profiles.map((user) => (
                <tr key={user.id} className="border-b border-clay/10">
                  <td className="px-4 py-3 text-bone">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-bone/70">{user.email}</td>
                  <td className="px-4 py-3">
                    <UserRoleSelect id={user.id} role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-bone/50">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
