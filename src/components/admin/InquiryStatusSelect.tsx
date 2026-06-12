"use client";

import { updateInquiryStatus } from "@/lib/admin/actions";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  normalizeInquiryStatus,
} from "@/lib/inquiry-status";
import type { InquiryStatus } from "@/types/database";

export function InquiryStatusSelect({
  id,
  status,
}: {
  id: string;
  status: InquiryStatus;
}) {
  const normalized = normalizeInquiryStatus(status);

  return (
    <form action={updateInquiryStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={normalized}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="border border-clay/30 bg-near-black px-2 py-1 text-xs uppercase tracking-widest text-bone focus:border-muted-gold focus:outline-none"
      >
        {INQUIRY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {INQUIRY_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
