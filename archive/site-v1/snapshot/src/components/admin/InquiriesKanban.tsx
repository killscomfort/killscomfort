"use client";

import { useMemo, useRef, useState, useTransition, type DragEvent, type MutableRefObject } from "react";
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
  getInquiryStatusShortLabel,
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

function columnAccentOpacity(index: number) {
  return Math.max(0.35, 0.95 - index * 0.12);
}

function InquiryCard({
  inquiry,
  columnStatus,
  draggingId,
  onSelect,
  didDragRef,
  setDraggingId,
  setDropTarget,
  onDropInColumn,
}: {
  inquiry: Inquiry;
  columnStatus: InquiryStatus;
  draggingId: string | null;
  onSelect: (inquiry: Inquiry) => void;
  didDragRef: MutableRefObject<boolean>;
  setDraggingId: (id: string | null) => void;
  setDropTarget: (status: InquiryStatus | null) => void;
  onDropInColumn: (status: InquiryStatus, e: DragEvent) => void;
}) {
  const isDragging = draggingId === inquiry.id;

  return (
    <article
      draggable
      onDragStart={(e) => {
        didDragRef.current = true;
        e.dataTransfer.setData("text/inquiry-id", inquiry.id);
        e.dataTransfer.setData("text/plain", inquiry.id);
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
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropTarget(columnStatus);
      }}
      onDrop={(e) => onDropInColumn(columnStatus, e)}
      onClick={() => {
        if (didDragRef.current) return;
        onSelect(inquiry);
      }}
      className={cn(
        "admin-kanban-card group relative cursor-grab overflow-hidden rounded-md border border-white/10 bg-near-black/80 p-3.5 active:cursor-grabbing",
        "hover:border-white/25",
        isDragging && "scale-[0.98] opacity-40 shadow-none"
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/50 via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start gap-2.5">
        <GripVertical
          className="mt-0.5 h-4 w-4 shrink-0 text-bone/20 transition-colors group-hover:text-bone/45"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium tracking-wide text-bone">
            {inquiry.name}
          </p>
          <p className="mt-1 truncate text-xs uppercase tracking-wider text-bone/55">
            {inquiry.event_type}
          </p>
          {(inquiry.event_date || inquiry.event_location) && (
            <div className="mt-3 space-y-1 border-t border-white/8 pt-3">
              {inquiry.event_date && (
                <p className="flex items-center gap-1.5 text-xs text-bone/50">
                  <Calendar className="h-3 w-3 shrink-0 text-bone/35" />
                  {formatShortDate(inquiry.event_date)}
                </p>
              )}
              {inquiry.event_location && (
                <p className="flex items-center gap-1.5 truncate text-xs text-bone/45">
                  <MapPin className="h-3 w-3 shrink-0 text-bone/35" />
                  {inquiry.event_location}
                </p>
              )}
            </div>
          )}
          {inquiry.budget_range && (
            <p className="mt-2 inline-block border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-bone/55">
              {inquiry.budget_range}
            </p>
          )}
          <p className="mt-2.5 text-[10px] uppercase tracking-[0.18em] text-bone/28">
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

  function readDraggedInquiryId(e: DragEvent) {
    return (
      e.dataTransfer.getData("text/inquiry-id") ||
      e.dataTransfer.getData("text/plain")
    );
  }

  function handleColumnDragOver(status: InquiryStatus, e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  }

  function handleColumnDragLeave(
    status: InquiryStatus,
    e: DragEvent<HTMLElement>
  ) {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDropTarget((current) => (current === status ? null : current));
  }

  function handleColumnDrop(status: InquiryStatus, e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const id = readDraggedInquiryId(e);
    if (id) handleDrop(status, id);
  }

  function handleDrop(status: InquiryStatus, inquiryId: string) {
    if (status === "archived") return;

    const inquiry = inquiries.find((i) => i.id === inquiryId);
    if (!inquiry || normalizeInquiryStatus(inquiry.status) === status) {
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
        setBulkMessage("");
      } catch (err) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? inquiry : i))
        );
        setBulkMessage(
          err instanceof Error
            ? `Could not save move: ${err.message}`
            : "Could not save move. Check that inquiry status migrations are applied in Supabase."
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-warm-charcoal/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-display text-2xl text-bone">{activeInquiries.length}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-bone/45">
              Active leads
            </span>
          </div>
          {archivedInquiries.length > 0 && (
            <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden />
          )}
          {archivedInquiries.length > 0 && (
            <span className="text-xs uppercase tracking-widest text-bone/40">
              {archivedInquiries.length} archived
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
              className="text-xs uppercase tracking-[0.18em] text-bone/50 transition-colors hover:text-bone"
            >
              {showArchived ? "Hide" : "Show"} archived
            </button>
          )}
        </div>
      </div>

      {bulkMessage && (
        <p
          className={cn(
            "mb-4 border px-3 py-2 text-xs uppercase tracking-wider",
            bulkMessage.startsWith("Could not")
              ? "border-dried-blood/40 bg-dried-blood/10 text-dried-blood"
              : "border-white/10 bg-white/5 text-bone/65"
          )}
        >
          {bulkMessage}
        </p>
      )}

      <div
        className={cn(
          "admin-kanban-board flex h-[calc(100vh-16rem)] min-h-[500px] gap-3 overflow-x-auto pb-3",
          isPending && "pointer-events-none opacity-80"
        )}
      >
        {INQUIRY_PIPELINE_STATUSES.map((status, index) => {
          const columnItems = byStatus[status];
          const isTarget = dropTarget === status;
          const accent = columnAccentOpacity(index);

          return (
            <div
              key={status}
              style={{ animationDelay: `${index * 60}ms` }}
              className={cn(
                "admin-kanban-column grain-overlay relative flex h-full min-w-[272px] max-w-[300px] flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-warm-charcoal/80 to-near-black/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                isTarget && "admin-kanban-column--target border-white/30"
              )}
              onDragOver={(e) => handleColumnDragOver(status, e)}
              onDragLeave={(e) => handleColumnDragLeave(status, e)}
              onDrop={(e) => handleColumnDrop(status, e)}
            >
              <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ opacity: accent }}
                aria-hidden
              />

              <div className="relative shrink-0 border-b border-white/8 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-bone/35">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="text-display mt-1 text-sm uppercase tracking-[0.12em] text-bone">
                      {getInquiryStatusShortLabel(status)}
                    </h3>
                  </div>
                  <span className="min-w-[1.75rem] rounded-full border border-white/12 bg-black/40 px-2 py-0.5 text-center text-xs tabular-nums text-bone/70">
                    {columnItems.length}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "relative flex min-h-[140px] flex-1 flex-col gap-2.5 overflow-y-auto p-2.5",
                  columnItems.length === 0 &&
                    isTarget &&
                    "bg-white/[0.03]"
                )}
                onDragOver={(e) => handleColumnDragOver(status, e)}
                onDrop={(e) => handleColumnDrop(status, e)}
              >
                {columnItems.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center rounded-md border border-dashed px-3 py-8 text-center transition-colors",
                      isTarget
                        ? "border-white/30 bg-white/[0.04] text-bone/50"
                        : "border-white/10 text-bone/28"
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.16em]">
                      {isTarget ? "Release to move" : "Drop leads here"}
                    </p>
                  </div>
                ) : (
                  columnItems.map((inquiry) => (
                    <InquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      columnStatus={status}
                      draggingId={draggingId}
                      onSelect={setSelected}
                      didDragRef={didDragRef}
                      setDraggingId={setDraggingId}
                      setDropTarget={setDropTarget}
                      onDropInColumn={handleColumnDrop}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showArchived && archivedInquiries.length > 0 && (
        <section className="mt-8 border-t border-white/10 pt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h3 className="text-display text-sm uppercase tracking-[0.14em] text-bone/60">
              Archived
            </h3>
            <span className="text-xs tabular-nums text-bone/35">
              {archivedInquiries.length} total
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archivedInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="grain-overlay rounded-md border border-white/10 bg-warm-charcoal/40 p-4 transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setSelected(inquiry)}
                  className="w-full text-left"
                >
                  <p className="font-medium tracking-wide text-bone">{inquiry.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-bone/50">
                    {inquiry.event_type}
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-bone/30">
                    Submitted {formatDate(inquiry.created_at)}
                  </p>
                </button>
                <div className="mt-4 flex gap-4 border-t border-white/8 pt-3">
                  <button
                    type="button"
                    onClick={() => handleQuickRestore(inquiry.id)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-bone/45 transition-colors hover:text-bone"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDelete(inquiry.id)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-dried-blood/80 transition-colors hover:text-dried-blood"
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
