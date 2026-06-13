import type { InquiryStatus } from "@/types/database";

/** Active pipeline columns on the Kanban board */
export const INQUIRY_PIPELINE_STATUSES: InquiryStatus[] = [
  "new",
  "contacted",
  "deposit_made",
  "collect_full_amount",
  "prep_for_event",
];

/** All statuses selectable in admin UI */
export const INQUIRY_STATUSES: InquiryStatus[] = [
  ...INQUIRY_PIPELINE_STATUSES,
  "archived",
];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  deposit_made: "Deposit Made",
  collect_full_amount: "Collect Full Amount",
  prep_for_event: "Prep for Event",
  archived: "Archived",
};

/** Inquiries older than this (by created_at) are eligible for bulk archive */
export const ARCHIVE_OLD_INQUIRIES_DAYS = 90;

const LEGACY_INQUIRY_STATUSES: Record<string, InquiryStatus> = {
  read: "contacted",
  responded: "contacted",
  negotiation: "contacted",
};

export function normalizeInquiryStatus(status: string): InquiryStatus {
  if (LEGACY_INQUIRY_STATUSES[status]) {
    return LEGACY_INQUIRY_STATUSES[status];
  }
  if (INQUIRY_STATUSES.includes(status as InquiryStatus)) {
    return status as InquiryStatus;
  }
  return "new";
}

export function getInquiryStatusLabel(status: string): string {
  return INQUIRY_STATUS_LABELS[normalizeInquiryStatus(status)];
}

export function isPipelineStatus(status: InquiryStatus): boolean {
  return INQUIRY_PIPELINE_STATUSES.includes(status);
}
