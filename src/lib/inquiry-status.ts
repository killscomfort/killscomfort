import type { InquiryStatus } from "@/types/database";

/** Active pipeline columns on the Kanban board */
export const INQUIRY_PIPELINE_STATUSES: InquiryStatus[] = [
  "new",
  "contacted",
  "deposit_made",
  "collect_full_amount",
  "prep_for_event",
];

/** All statuses including archived */
export const INQUIRY_STATUSES: InquiryStatus[] = [
  ...INQUIRY_PIPELINE_STATUSES,
  "archived",
];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  negotiation: "Negotiation",
  deposit_made: "Deposit Made",
  collect_full_amount: "Collect Full Amount",
  prep_for_event: "Prep for Event",
  archived: "Archived",
};

/** Inquiries older than this (by created_at) are eligible for bulk archive */
export const ARCHIVE_OLD_INQUIRIES_DAYS = 90;

export function normalizeInquiryStatus(status: string): InquiryStatus {
  const legacy: Record<string, InquiryStatus> = {
    read: "contacted",
    responded: "contacted",
    negotiation: "contacted",
  };
  if (legacy[status]) return legacy[status];
  if (INQUIRY_STATUSES.includes(status as InquiryStatus)) {
    return status as InquiryStatus;
  }
  return "new";
}

export function isPipelineStatus(status: InquiryStatus): boolean {
  return INQUIRY_PIPELINE_STATUSES.includes(status);
}
