import type { NewsletterDraftStatus } from "@/types/database";

/** Active pipeline columns on the Kanban board */
export const NEWSLETTER_PIPELINE_STATUSES: NewsletterDraftStatus[] = [
  "collecting",
  "draft",
  "in_review",
  "approved",
  "sent",
];

/** All statuses selectable in admin UI */
export const NEWSLETTER_DRAFT_STATUSES: NewsletterDraftStatus[] = [
  ...NEWSLETTER_PIPELINE_STATUSES,
  "archived",
];

export const NEWSLETTER_DRAFT_STATUS_LABELS: Record<
  NewsletterDraftStatus,
  string
> = {
  collecting: "Collecting Events",
  draft: "Draft Ready",
  in_review: "In Review",
  approved: "Approved",
  sent: "Sent",
  archived: "Archived",
};

export const NEWSLETTER_DRAFT_STATUS_SHORT_LABELS = {
  collecting: "Collect",
  draft: "Draft",
  in_review: "Review",
  approved: "Approved",
  sent: "Sent",
} as const satisfies Partial<Record<NewsletterDraftStatus, string>>;

export function getNewsletterDraftStatusShortLabel(
  status: NewsletterDraftStatus
): string {
  if (status in NEWSLETTER_DRAFT_STATUS_SHORT_LABELS) {
    return NEWSLETTER_DRAFT_STATUS_SHORT_LABELS[
      status as keyof typeof NEWSLETTER_DRAFT_STATUS_SHORT_LABELS
    ];
  }
  return NEWSLETTER_DRAFT_STATUS_LABELS[status];
}

export function normalizeNewsletterDraftStatus(
  status: string
): NewsletterDraftStatus {
  if (NEWSLETTER_DRAFT_STATUSES.includes(status as NewsletterDraftStatus)) {
    return status as NewsletterDraftStatus;
  }
  return "draft";
}

export function getNewsletterDraftStatusLabel(status: string): string {
  return NEWSLETTER_DRAFT_STATUS_LABELS[normalizeNewsletterDraftStatus(status)];
}

export function isNewsletterDraftPipelineStatus(
  status: NewsletterDraftStatus
): boolean {
  return NEWSLETTER_PIPELINE_STATUSES.includes(status);
}
