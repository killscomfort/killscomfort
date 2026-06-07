import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-display text-3xl uppercase text-bone">Users</h1>
            <Link href="/admin" className="text-sm text-muted-gold hover:text-bone">
              ← Admin
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-clay/20 text-left text-bone/50">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((user) => (
                  <tr key={user.id} className="border-b border-clay/10">
                    <td className="py-3 pr-4 text-bone">
                      {user.full_name || "—"}
                    </td>
                    <td className="py-3 pr-4 text-bone/70">{user.email}</td>
                    <td className="py-3 pr-4 text-muted-gold uppercase text-xs">
                      {user.role}
                    </td>
                    <td className="py-3 text-bone/50">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
