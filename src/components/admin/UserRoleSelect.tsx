"use client";

import { updateUserRole } from "@/lib/admin/actions";
import type { UserRole } from "@/types/database";

const ROLES: UserRole[] = ["user", "premium", "admin"];

export function UserRoleSelect({
  id,
  role,
}: {
  id: string;
  role: UserRole;
}) {
  return (
    <form action={updateUserRole}>
      <input type="hidden" name="id" value={id} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="border border-clay/30 bg-near-black px-2 py-1 text-xs uppercase tracking-widest text-muted-gold focus:border-muted-gold focus:outline-none"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </form>
  );
}
