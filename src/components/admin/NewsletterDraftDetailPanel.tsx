"use client";

import { useState, useTransition } from "react";
import { Send, X } from "lucide-react";
import {
  archiveNewsletterDraftById,
  deleteNewsletterDraft,
  restoreNewsletterDraftById,
  sendNewsletterDraft,
  updateNewsletterDraft,
} from "@/lib/admin/actions";
import {
  NEWSLETTER_DRAFT_STATUSES,
  NEWSLETTER_DRAFT_STATUS_LABELS,
  getNewsletterDraftStatusLabel,
  normalizeNewsletterDraftStatus,
} from "@/lib/newsletter-draft-status";
import { MIAMI_NEWSLETTER_EVENT_SOURCES } from "@/lib/newsletter-sources";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { NewsletterDraft, NewsletterDraftStatus } from "@/types/database";

type Props = {
  draft: NewsletterDraft;
  activeSubscriberCount: number;
  onClose: () => void;
  onUpdated: (draft: NewsletterDraft) => void;
  onDeleted?: (id: string) => void;
  onArchived?: (id: string) => void;
  onSent?: (draft: NewsletterDraft) => void;
};

export function NewsletterDraftDetailPanel({
  draft,
  activeSubscriberCount,
  onClose,
  onUpdated,
  onDeleted,
  onArchived,
  onSent,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedStatus = normalizeNewsletterDraftStatus(draft.status);
  const isArchived = normalizedStatus === "archived";
  const isSent = normalizedStatus === "sent";
  const canSend = normalizedStatus === "approved" || normalizedStatus === "in_review";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateNewsletterDraft(formData);
        const updated: NewsletterDraft = {
          ...draft,
          title: String(formData.get("title")).trim(),
          subject: String(formData.get("subject")).trim(),
          preheader: String(formData.get("preheader") || "").trim() || null,
          content_html: String(formData.get("content_html") || ""),
          status: String(formData.get("status")) as NewsletterDraftStatus,
          updated_at: new Date().toISOString(),
        };
        onUpdated(updated);
        setEditing(false);
        setMessage("Draft saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes");
      }
    });
  }

  function handleSend() {
    if (
      !confirm(
        `Send "${draft.subject}" to ${activeSubscriberCount} active subscriber${activeSubscriberCount === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const { sentCount } = await sendNewsletterDraft(draft.id);
        const updated: NewsletterDraft = {
          ...draft,
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
          updated_at: new Date().toISOString(),
        };
        onSent?.(updated);
        onUpdated(updated);
        setMessage(`Sent to ${sentCount} subscriber${sentCount === 1 ? "" : "s"}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send newsletter");
      }
    });
  }

  function handleArchive() {
    startTransition(async () => {
      try {
        await archiveNewsletterDraftById(draft.id);
        onArchived?.(draft.id);
        onClose();
      } catch {
        setError("Failed to archive draft.");
      }
    });
  }

  function handleRestore() {
    startTransition(async () => {
      try {
        await restoreNewsletterDraftById(draft.id);
        onUpdated({ ...draft, status: "draft" });
        onClose();
      } catch {
        setError("Failed to restore draft.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this draft permanently? This cannot be undone.")) return;

    startTransition(async () => {
      try {
        await deleteNewsletterDraft(draft.id);
        onDeleted?.(draft.id);
        onClose();
      } catch {
        setError("Failed to delete draft.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-near-black/85 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="grain-overlay max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-white/12 bg-warm-charcoal shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-draft-title"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-warm-charcoal/95 px-5 py-5 backdrop-blur-md">
          <div>
            <span className="inline-block border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-bone/70">
              {getNewsletterDraftStatusLabel(draft.status)}
            </span>
            <h2
              id="newsletter-draft-title"
              className="text-display mt-3 text-2xl uppercase tracking-wide text-bone"
            >
              {draft.title}
            </h2>
            <p className="mt-1 text-sm text-bone/55">{draft.subject}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-transparent p-1.5 text-bone/45 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-bone"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <input type="hidden" name="id" value={draft.id} />

            <div className="space-y-2">
              <label htmlFor="draft-status" className="block text-sm text-bone/80">
                Status
              </label>
              <select
                id="draft-status"
                name="status"
                defaultValue={normalizedStatus}
                className="w-full border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone focus:border-muted-gold focus:outline-none"
              >
                {NEWSLETTER_DRAFT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {NEWSLETTER_DRAFT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Internal title" name="title" defaultValue={draft.title} required />
            <Input label="Email subject" name="subject" defaultValue={draft.subject} required />
            <Input
              label="Preheader"
              name="preheader"
              defaultValue={draft.preheader || ""}
            />
            <Textarea
              label="Email body (HTML)"
              name="content_html"
              rows={14}
              defaultValue={draft.content_html}
            />

            {error && <p className="text-sm text-dried-blood">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-5 p-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {draft.preheader && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-widest text-bone/40">
                      Preheader
                    </dt>
                    <dd className="text-bone">{draft.preheader}</dd>
                  </div>
                )}
                {draft.sent_at && (
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-bone/40">Sent</dt>
                    <dd className="text-bone">
                      {formatDate(draft.sent_at)} · {draft.sent_count} recipients
                    </dd>
                  </div>
                )}
                {draft.approved_at && (
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-bone/40">
                      Approved
                    </dt>
                    <dd className="text-bone">{formatDate(draft.approved_at)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Updated</dt>
                  <dd className="text-bone">{formatDate(draft.updated_at)}</dd>
                </div>
              </dl>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-bone/40">
                  Email preview
                </p>
                <div
                  className="border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-bone/85 [&_a]:text-bone [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: draft.content_html }}
                />
              </div>

              {draft.source_events.length > 0 && (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-bone/40">
                    Collected events ({draft.source_events.length})
                  </p>
                  <ul className="space-y-2 border border-white/10 bg-black/25 px-4 py-3 text-sm text-bone/70">
                    {draft.source_events.map((event, index) => (
                      <li key={`${event.title}-${index}`}>
                        <strong className="text-bone">{event.title}</strong>
                        {event.event_date ? ` · ${event.event_date}` : ""}
                        {event.venue ? ` · ${event.venue}` : ""}
                        {event.source ? (
                          <span className="block text-xs text-bone/40">via {event.source}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-bone/40">
                  Instagram sources to scan
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {MIAMI_NEWSLETTER_EVENT_SOURCES.map((source) => (
                    <li
                      key={source.handle}
                      className="border border-white/8 bg-black/20 px-3 py-2 text-xs text-bone/60"
                    >
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-bone hover:text-muted-gold"
                      >
                        @{source.handle}
                      </a>
                      <span className="block text-bone/40">{source.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {message && <p className="text-sm text-moss-green">{message}</p>}
              {error && <p className="text-sm text-dried-blood">{error}</p>}
            </div>

            <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-white/10 bg-warm-charcoal/95 px-5 py-4 backdrop-blur-md">
              {!isSent && (
                <Button type="button" size="sm" onClick={() => setEditing(true)}>
                  Edit draft
                </Button>
              )}
              {canSend && !isSent && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSend}
                  disabled={isPending || activeSubscriberCount === 0}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Send to {activeSubscriberCount}
                </Button>
              )}
              {isArchived ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isPending}
                >
                  Restore
                </Button>
              ) : (
                !isSent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleArchive}
                    disabled={isPending}
                  >
                    Archive
                  </Button>
                )
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-dried-blood hover:text-bone"
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
