"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import {
  archiveInquiryById,
  deleteInquiry,
  restoreInquiryById,
  updateInquiry,
} from "@/lib/admin/actions";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  normalizeInquiryStatus,
} from "@/lib/inquiry-status";
import { BUDGET_RANGES, EVENT_TYPES, CONTACT_METHODS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { Inquiry, InquiryStatus } from "@/types/database";

type Props = {
  inquiry: Inquiry;
  onClose: () => void;
  onUpdated: (inquiry: Inquiry) => void;
  onDeleted?: (id: string) => void;
  onArchived?: (id: string) => void;
};

export function InquiryDetailPanel({
  inquiry,
  onClose,
  onUpdated,
  onDeleted,
  onArchived,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedStatus = normalizeInquiryStatus(inquiry.status);
  const isArchived = normalizedStatus === "archived";

  function handleDelete() {
    if (!confirm("Delete this inquiry permanently? This cannot be undone.")) return;

    startTransition(async () => {
      try {
        await deleteInquiry(inquiry.id);
        onDeleted?.(inquiry.id);
        onClose();
      } catch {
        setError("Failed to delete inquiry.");
      }
    });
  }

  function handleArchive() {
    startTransition(async () => {
      try {
        await archiveInquiryById(inquiry.id);
        onArchived?.(inquiry.id);
        onClose();
      } catch {
        setError("Failed to archive inquiry.");
      }
    });
  }

  function handleRestore() {
    startTransition(async () => {
      try {
        await restoreInquiryById(inquiry.id);
        onUpdated({ ...inquiry, status: "new" });
        onClose();
      } catch {
        setError("Failed to restore inquiry.");
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateInquiry(formData);
        const updated: Inquiry = {
          ...inquiry,
          status: String(formData.get("status")) as InquiryStatus,
          phone: String(formData.get("phone") || "").trim() || null,
          preferred_contact: String(formData.get("preferred_contact") || "").trim() || null,
          event_type: String(formData.get("event_type")).trim(),
          event_date: String(formData.get("event_date") || "").trim() || null,
          event_location: String(formData.get("event_location") || "").trim() || null,
          budget_range: String(formData.get("budget_range") || "").trim() || null,
          message: String(formData.get("message") || "").trim() || null,
        };
        onUpdated(updated);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-near-black/80 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-clay/30 bg-warm-charcoal shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-detail-title"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-clay/20 bg-warm-charcoal px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-gold">
              {INQUIRY_STATUS_LABELS[normalizedStatus]}
            </p>
            <h2 id="inquiry-detail-title" className="mt-1 text-xl text-bone">
              {inquiry.name}
            </h2>
            <a
              href={`mailto:${inquiry.email}`}
              className="text-sm text-bone/70 hover:text-muted-gold"
            >
              {inquiry.email}
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-bone/50 hover:bg-clay/20 hover:text-bone"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <input type="hidden" name="id" value={inquiry.id} />

            <div className="space-y-2">
              <label htmlFor="inquiry-status" className="block text-sm text-bone/80">
                Status
              </label>
              <select
                id="inquiry-status"
                name="status"
                defaultValue={normalizedStatus}
                className="w-full border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone focus:border-muted-gold focus:outline-none"
              >
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {INQUIRY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Phone" name="phone" defaultValue={inquiry.phone || ""} />

            <div className="space-y-2">
              <label htmlFor="preferred-contact" className="block text-sm text-bone/80">
                Preferred contact
              </label>
              <select
                id="preferred-contact"
                name="preferred_contact"
                defaultValue={inquiry.preferred_contact || ""}
                className="w-full border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone focus:border-muted-gold focus:outline-none"
              >
                <option value="">—</option>
                {CONTACT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <Select
              label="Event type"
              name="event_type"
              defaultValue={inquiry.event_type}
              options={[...EVENT_TYPES]}
            />

            <Input
              label="Event date"
              name="event_date"
              type="date"
              defaultValue={inquiry.event_date || ""}
            />

            <Input
              label="Location"
              name="event_location"
              defaultValue={inquiry.event_location || ""}
            />

            <div className="space-y-2">
              <label htmlFor="budget-range" className="block text-sm text-bone/80">
                Budget
              </label>
              <select
                id="budget-range"
                name="budget_range"
                defaultValue={inquiry.budget_range || ""}
                className="w-full border border-clay/30 bg-warm-charcoal/80 px-4 py-3 text-bone focus:border-muted-gold focus:outline-none"
              >
                <option value="">—</option>
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Message"
              name="message"
              rows={4}
              defaultValue={inquiry.message || ""}
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
          <div className="space-y-4 p-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {inquiry.phone && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Phone</dt>
                  <dd className="text-bone">{inquiry.phone}</dd>
                </div>
              )}
              {inquiry.preferred_contact && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Contact via</dt>
                  <dd className="text-bone">{inquiry.preferred_contact}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-widest text-bone/40">Event</dt>
                <dd className="text-bone">{inquiry.event_type}</dd>
              </div>
              {inquiry.event_date && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Date</dt>
                  <dd className="text-bone">{formatDate(inquiry.event_date)}</dd>
                </div>
              )}
              {inquiry.event_location && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Location</dt>
                  <dd className="text-bone">{inquiry.event_location}</dd>
                </div>
              )}
              {inquiry.budget_range && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Budget</dt>
                  <dd className="text-bone">{inquiry.budget_range}</dd>
                </div>
              )}
              {inquiry.source && (
                <div>
                  <dt className="text-xs uppercase tracking-widest text-bone/40">Source</dt>
                  <dd className="text-bone">{inquiry.source}</dd>
                </div>
              )}
            </dl>

            {inquiry.message && (
              <div>
                <p className="text-xs uppercase tracking-widest text-bone/40">Message</p>
                <p className="mt-1 text-sm leading-relaxed text-bone/70">{inquiry.message}</p>
              </div>
            )}

            {(inquiry.utm_source || inquiry.utm_medium) && (
              <p className="text-xs text-bone/40">
                UTM: {inquiry.utm_source}
                {inquiry.utm_medium ? ` / ${inquiry.utm_medium}` : ""}
              </p>
            )}

            <p className="text-xs text-bone/35">
              Submitted {formatDate(inquiry.created_at)}
            </p>

            {error && <p className="text-sm text-dried-blood">{error}</p>}

            <div className="flex flex-wrap gap-2 border-t border-clay/15 pt-4">
              <Button type="button" size="sm" onClick={() => setEditing(true)}>
                Edit inquiry
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                href={`mailto:${inquiry.email}`}
              >
                Email lead
              </Button>
              {isArchived ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isPending}
                >
                  Restore to New
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleArchive}
                  disabled={isPending}
                >
                  Archive
                </Button>
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
          </div>
        )}
      </div>
    </div>
  );
}
