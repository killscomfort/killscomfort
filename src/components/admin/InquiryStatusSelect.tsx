"use client";

import { updateInquiryStatus } from "@/lib/admin/actions";
import type { InquiryStatus } from "@/types/database";

const STATUSES: InquiryStatus[] = ["new", "read", "responded", "archived"];

export function InquiryStatusSelect({
  id,
  status,
}: {
  id: string;
  status: InquiryStatus;
}) {
  return (
    <form action={updateInquiryStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="border border-clay/30 bg-near-black px-2 py-1 text-xs uppercase tracking-widest text-bone focus:border-muted-gold focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
