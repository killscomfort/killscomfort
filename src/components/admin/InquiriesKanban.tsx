"use client";

import { useMemo, useRef, useState, useTransition, type MutableRefObject } from "react";
import { Archive, Calendar, GripVertical, MapPin, RotateCcw, Trash2 } from "lucide-react";
import {
  archiveOldInquiries,
  deleteInquiry,
  restoreInquiryById,
  updateInquiryStatusById,
} from "@/lib/admin/actions";
import {
  ARCHIVE_OLD_INQUIRIES_DAYS,
  INQUIRY_PIPELINE_STATUSES,
  INQUIRY_STATUS_LABELS,
  normalizeInquiryStatus,
} from "@/lib/inquiry-status";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Inquiry, InquiryStatus } from "@/types/database";
import { InquiryDetailPanel } from "./InquiryDetailPanel";

type Props = {
  inquiries: Inquiry[];
};

function formatShortDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InquiryCard({
  inquiry,
  draggingId,
  onSelect,
  didDragRef,
  setDraggingId,
  setDropTarget,
}: {
  inquiry: Inquiry;
  draggingId: string | null;
  onSelect: (inquiry: Inquiry) => void;
  didDragRef: MutableRefObject<boolean>;
  setDraggingId: (id: string | null) => void;
  setDropTarget: (status: InquiryStatus | null) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        didDragRef.current = true;
        e.dataTransfer.setData("text/inquiry-id", inquiry.id);
        e.dataTransfer.effectAllowed = "move";
        setDraggingId(inquiry.id);
      }}
      onDragEnd={() => {
        setDraggingId(null);
        setDropTarget(null);
        setTimeout(() => {
          didDragRef.current = false;
        }, 0);
      }}
      onClick={() => {
        if (didDragRef.current) return;
        onSelect(inquiry);
      }}
      className={cn(
        "cursor-grab rounded-md border border-clay/25 bg-near-black p-3 shadow-sm transition hover:border-muted-gold/40 active:cursor-grabbing",
        draggingId === inquiry.id && "opacity-40"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-bone/25" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-bone">{inquiry.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-gold">{inquiry.event_type}</p>
          {inquiry.event_date && (
            <p className="mt-2 flex items-center gap-1 text-xs text-bone/55">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatShortDate(inquiry.event_date)}
            </p>
          )}
          {inquiry.event_location && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-bone/45">
              <MapPin className="h-3 w-3 shrink-0" />
              {inquiry.event_location}
            </p>
          )}
          {inquiry.budget_range && (
            <p className="mt-2 text-xs text-bone/50">{inquiry.budget_range}</p>
          )}
          <p className="mt-2 text-[10px] uppercase tracking-wider text-bone/30">
            {formatDate(inquiry.created_at)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function InquiriesKanban({ inquiries: initialInquiries }: Props) {
  const [inquiries, setInquiries] = useState(() =>
    initialInquiries.map((i) => ({
      ...i,
      status: normalizeInquiryStatus(i.status),
    }))
  );
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<InquiryStatus | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const didDragRef = useRef(false);

  const activeInquiries = useMemo(
    () => inquiries.filter((i) => i.status !== "archived"),
    [inquiries]
  );
  const archivedInquiries = useMemo(
    () => inquiries.filter((i) => i.status === "archived"),
    [inquiries]
  );

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      INQUIRY_PIPELINE_STATUSES.map((s) => [s, [] as Inquiry[]])
    ) as Record<(typeof INQUIRY_PIPELINE_STATUSES)[number], Inquiry[]>;

    for (const inquiry of activeInquiries) {
      const status = normalizeInquiryStatus(inquiry.status);
      if (status !== "archived" && map[status as keyof typeof map]) {
        map[status as keyof typeof map].push({ ...inquiry, status });
      }
    }

    return map;
  }, [activeInquiries]);

  function handleDrop(status: InquiryStatus, inquiryId: string) {
    if (status === "archived") return;

    const inquiry = inquiries.find((i) => i.id === inquiryId);
    if (!inquiry || inquiry.status === status) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }

    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
    );
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      try {
        await updateInquiryStatusById(inquiryId, status);
        setSelected((current) =>
          current?.id === inquiryId ? { ...current, status } : current
        );
      } catch {
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? inquiry : i))
        );
      }
    });
  }

  function handleInquiryUpdated(updated: Inquiry) {
    setInquiries((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
    setSelected(updated);
  }

  function handleInquiryRemoved(id: string) {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setSelected(null);
  }

  function handleArchiveOld() {
    if (
      !confirm(
        `Archive all active inquiries older than ${ARCHIVE_OLD_INQUIRIES_DAYS} days?`
      )
    ) {
      return;
    }

    setBulkMessage("");
    startTransition(async () => {
      try {
        const { archived } = await archiveOldInquiries();
        setInquiries((prev) =>
          prev.map((i) =>
            i.status !== "archived" &&
            new Date(i.created_at) <
              new Date(Date.now() - ARCHIVE_OLD_INQUIRIES_DAYS * 86400000)
              ? { ...i, status: "archived" as InquiryStatus }
              : i
          )
        );
        setBulkMessage(
          archived > 0
            ? `Archived ${archived} inquiry${archived === 1 ? "" : "ies"}.`
            : "No inquiries matched the archive criteria."
        );
        setShowArchived(true);
      } catch {
        setBulkMessage("Failed to archive old inquiries.");
      }
    });
  }

  function handleQuickRestore(id: string) {
    startTransition(async () => {
      try {
        await restoreInquiryById(id);
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "new" } : i))
        );
      } catch {
        setBulkMessage("Failed to restore inquiry.");
      }
    });
  }

  function handleQuickDelete(id: string) {
    if (!confirm("Delete this inquiry permanently? This cannot be undone.")) return;

    startTransition(async () => {
      try {
        await deleteInquiry(id);
        handleInquiryRemoved(id);
      } catch {
        setBulkMessage("Failed to delete inquiry.");
      }
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleArchiveOld}
          disabled={isPending}
        >
          <Archive className="mr-1.5 h-3.5 w-3.5" />
          Archive older than {ARCHIVE_OLD_INQUIRIES_DAYS} days
        </Button>
        {archivedInquiries.length > 0 && (
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs uppercase tracking-widest text-bone/50 hover:text-muted-gold"
          >
            {showArchived ? "Hide" : "Show"} archived ({archivedInquiries.length})
          </button>
        )}
        {bulkMessage && (
          <p className="text-xs text-bone/60">{bulkMessage}</p>
        )}
      </div>

      <div
        className={cn(
          "flex h-[calc(100vh-14rem)] min-h-[480px] gap-3 overflow-x-auto pb-2",
          isPending && "opacity-90"
        )}
      >
        {INQUIRY_PIPELINE_STATUSES.map((status) => {
          const columnItems = byStatus[status];
          const isTarget = dropTarget === status;

          return (
            <div
              key={status}
              className={cn(
                "flex h-full min-w-[260px] max-w-[320px] flex-1 flex-col rounded-lg border bg-warm-charcoal/40",
                isTarget ? "border-muted-gold/60" : "border-clay/20"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(status);
              }}
              onDragLeave={() => {
                setDropTarget((current) => (current === status ? null : current));
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/inquiry-id");
                if (id) handleDrop(status, id);
              }}
            >
              <div className="shrink-0 border-b border-clay/15 px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-bone">
                    {INQUIRY_STATUS_LABELS[status]}
                  </h3>
                  <span className="rounded-full bg-clay/20 px-2 py-0.5 text-xs text-bone/60">
                    {columnItems.length}
                  </span>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
                {columnItems.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-bone/30">
                    Drop leads here
                  </p>
                ) : (
                  columnItems.map((inquiry) => (
                    <InquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      draggingId={draggingId}
                      onSelect={setSelected}
                      didDragRef={didDragRef}
                      setDraggingId={setDraggingId}
                      setDropTarget={setDropTarget}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showArchived && archivedInquiries.length > 0 && (
        <section className="mt-6 border-t border-clay/20 pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-bone/50">
            Archived ({archivedInquiries.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archivedInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-md border border-clay/20 bg-warm-charcoal/30 p-4"
              >
                <button
                  type="button"
                  onClick={() => setSelected(inquiry)}
                  className="w-full text-left"
                >
                  <p className="font-medium text-bone">{inquiry.name}</p>
                  <p className="mt-1 text-xs text-muted-gold">{inquiry.event_type}</p>
                  <p className="mt-2 text-xs text-bone/40">
                    Submitted {formatDate(inquiry.created_at)}
                  </p>
                </button>
                <div className="mt-3 flex gap-3 border-t border-clay/10 pt-3">
                  <button
                    type="button"
                    onClick={() => handleQuickRestore(inquiry.id)}
                    className="flex items-center gap-1 text-xs uppercase tracking-widest text-bone/50 hover:text-muted-gold"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDelete(inquiry.id)}
                    className="flex items-center gap-1 text-xs uppercase tracking-widest text-dried-blood hover:text-bone"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <InquiryDetailPanel
          inquiry={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleInquiryUpdated}
          onDeleted={handleInquiryRemoved}
          onArchived={(id) => {
            setInquiries((prev) =>
              prev.map((i) => (i.id === id ? { ...i, status: "archived" } : i))
            );
            setSelected(null);
            setShowArchived(true);
          }}
        />
      )}
    </>
  );
}
