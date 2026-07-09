"use client";

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type MutableRefObject,
} from "react";
import { GripVertical, RotateCcw, Trash2 } from "lucide-react";
import {
  deleteNewsletterDraft,
  restoreNewsletterDraftById,
  updateNewsletterDraftStatusById,
} from "@/lib/admin/actions";
import {
  NEWSLETTER_PIPELINE_STATUSES,
  getNewsletterDraftStatusShortLabel,
  normalizeNewsletterDraftStatus,
} from "@/lib/newsletter-draft-status";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NewsletterDraft, NewsletterDraftStatus } from "@/types/database";
import { NewsletterDraftDetailPanel } from "./NewsletterDraftDetailPanel";

type Props = {
  drafts: NewsletterDraft[];
  activeSubscriberCount: number;
};

function columnAccentOpacity(index: number) {
  return Math.max(0.35, 0.95 - index * 0.12);
}

function DraftCard({
  draft,
  columnStatus,
  draggingId,
  onSelect,
  didDragRef,
  setDraggingId,
  setDropTarget,
  onDropInColumn,
}: {
  draft: NewsletterDraft;
  columnStatus: NewsletterDraftStatus;
  draggingId: string | null;
  onSelect: (draft: NewsletterDraft) => void;
  didDragRef: MutableRefObject<boolean>;
  setDraggingId: (id: string | null) => void;
  setDropTarget: (status: NewsletterDraftStatus | null) => void;
  onDropInColumn: (status: NewsletterDraftStatus, e: DragEvent) => void;
}) {
  const isDragging = draggingId === draft.id;

  return (
    <article
      draggable={draft.status !== "sent"}
      onDragStart={(e) => {
        if (draft.status === "sent") return;
        didDragRef.current = true;
        e.dataTransfer.setData("text/newsletter-draft-id", draft.id);
        e.dataTransfer.setData("text/plain", draft.id);
        e.dataTransfer.effectAllowed = "move";
        setDraggingId(draft.id);
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
        onSelect(draft);
      }}
      className={cn(
        "admin-kanban-card group relative cursor-grab overflow-hidden rounded-md border border-white/10 bg-near-black/80 p-3.5 active:cursor-grabbing",
        "hover:border-white/25",
        isDragging && "scale-[0.98] opacity-40 shadow-none",
        draft.status === "sent" && "cursor-pointer opacity-90"
      )}
    >
      <div className="flex items-start gap-2.5">
        <GripVertical
          className="mt-0.5 h-4 w-4 shrink-0 text-bone/20 transition-colors group-hover:text-bone/45"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium tracking-wide text-bone">
            {draft.title}
          </p>
          <p className="mt-1 truncate text-xs text-bone/55">{draft.subject}</p>
          {draft.source_events.length > 0 && (
            <p className="mt-2 text-[10px] uppercase tracking-widest text-bone/35">
              {draft.source_events.length} event
              {draft.source_events.length === 1 ? "" : "s"}
            </p>
          )}
          {draft.status === "sent" && (
            <p className="mt-2 text-[10px] uppercase tracking-widest text-moss-green/80">
              {draft.sent_count} sent
            </p>
          )}
          <p className="mt-2.5 text-[10px] uppercase tracking-[0.18em] text-bone/28">
            {formatDate(draft.updated_at)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function NewsletterDraftsKanban({
  drafts: initialDrafts,
  activeSubscriberCount,
}: Props) {
  const [drafts, setDrafts] = useState(() =>
    initialDrafts.map((draft) => ({
      ...draft,
      status: normalizeNewsletterDraftStatus(draft.status),
      source_events: Array.isArray(draft.source_events) ? draft.source_events : [],
    }))
  );
  const [selected, setSelected] = useState<NewsletterDraft | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<NewsletterDraftStatus | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const didDragRef = useRef(false);

  const activeDrafts = useMemo(
    () => drafts.filter((draft) => draft.status !== "archived"),
    [drafts]
  );
  const archivedDrafts = useMemo(
    () => drafts.filter((draft) => draft.status === "archived"),
    [drafts]
  );

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      NEWSLETTER_PIPELINE_STATUSES.map((status) => [status, [] as NewsletterDraft[]])
    ) as Record<(typeof NEWSLETTER_PIPELINE_STATUSES)[number], NewsletterDraft[]>;

    for (const draft of activeDrafts) {
      const status = normalizeNewsletterDraftStatus(draft.status);
      if (status !== "archived" && map[status as keyof typeof map]) {
        map[status as keyof typeof map].push({ ...draft, status });
      }
    }

    return map;
  }, [activeDrafts]);

  function readDraggedDraftId(e: DragEvent) {
    return (
      e.dataTransfer.getData("text/newsletter-draft-id") ||
      e.dataTransfer.getData("text/plain")
    );
  }

  function handleColumnDragOver(status: NewsletterDraftStatus, e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  }

  function handleColumnDragLeave(
    status: NewsletterDraftStatus,
    e: DragEvent<HTMLElement>
  ) {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDropTarget((current) => (current === status ? null : current));
  }

  function handleColumnDrop(status: NewsletterDraftStatus, e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const id = readDraggedDraftId(e);
    if (id) handleDrop(status, id);
  }

  function handleDrop(status: NewsletterDraftStatus, draftId: string) {
    if (status === "archived" || status === "sent") return;

    const draft = drafts.find((item) => item.id === draftId);
    if (!draft || normalizeNewsletterDraftStatus(draft.status) === status) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }

    setDrafts((prev) =>
      prev.map((item) => (item.id === draftId ? { ...item, status } : item))
    );
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      try {
        await updateNewsletterDraftStatusById(draftId, status);
        setSelected((current) =>
          current?.id === draftId ? { ...current, status } : current
        );
        setBulkMessage("");
      } catch (err) {
        setDrafts((prev) =>
          prev.map((item) => (item.id === draftId ? draft : item))
        );
        setBulkMessage(
          err instanceof Error
            ? `Could not save move: ${err.message}`
            : "Could not save move. Apply the newsletter_drafts migration in Supabase."
        );
      }
    });
  }

  function handleDraftUpdated(updated: NewsletterDraft) {
    setDrafts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelected(updated);
  }

  function handleDraftRemoved(id: string) {
    setDrafts((prev) => prev.filter((item) => item.id !== id));
    setSelected(null);
  }

  function handleQuickRestore(id: string) {
    startTransition(async () => {
      try {
        await restoreNewsletterDraftById(id);
        setDrafts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "draft" } : item))
        );
      } catch {
        setBulkMessage("Failed to restore draft.");
      }
    });
  }

  function handleQuickDelete(id: string) {
    if (!confirm("Delete this draft permanently? This cannot be undone.")) return;

    startTransition(async () => {
      try {
        await deleteNewsletterDraft(id);
        handleDraftRemoved(id);
      } catch {
        setBulkMessage("Failed to delete draft.");
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-warm-charcoal/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-display text-2xl text-bone">{activeDrafts.length}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-bone/45">
              Active drafts
            </span>
          </div>
          <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden />
          <span className="text-xs uppercase tracking-widest text-bone/40">
            {activeSubscriberCount} subscribers ready
          </span>
        </div>

        {archivedDrafts.length > 0 && (
          <button
            type="button"
            onClick={() => setShowArchived((value) => !value)}
            className="text-xs uppercase tracking-[0.18em] text-bone/50 transition-colors hover:text-bone"
          >
            {showArchived ? "Hide" : "Show"} archived ({archivedDrafts.length})
          </button>
        )}
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
          "admin-kanban-board flex h-[calc(100vh-18rem)] min-h-[500px] gap-3 overflow-x-auto pb-3",
          isPending && "pointer-events-none opacity-80"
        )}
      >
        {NEWSLETTER_PIPELINE_STATUSES.map((status, index) => {
          const columnItems = byStatus[status];
          const isTarget = dropTarget === status;
          const accent = columnAccentOpacity(index);
          const isSentColumn = status === "sent";

          return (
            <div
              key={status}
              style={{ animationDelay: `${index * 60}ms` }}
              className={cn(
                "admin-kanban-column grain-overlay relative flex h-full min-w-[240px] max-w-[280px] flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-warm-charcoal/80 to-near-black/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                isTarget && !isSentColumn && "admin-kanban-column--target border-white/30"
              )}
              onDragOver={(e) => {
                if (!isSentColumn) handleColumnDragOver(status, e);
              }}
              onDragLeave={(e) => handleColumnDragLeave(status, e)}
              onDrop={(e) => {
                if (!isSentColumn) handleColumnDrop(status, e);
              }}
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
                      {getNewsletterDraftStatusShortLabel(status)}
                    </h3>
                    {isSentColumn && (
                      <p className="mt-1 text-[10px] text-bone/35">Use Send in draft panel</p>
                    )}
                  </div>
                  <span className="min-w-[1.75rem] rounded-full border border-white/12 bg-black/40 px-2 py-0.5 text-center text-xs tabular-nums text-bone/70">
                    {columnItems.length}
                  </span>
                </div>
              </div>

              <div className="relative flex min-h-[140px] flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
                {columnItems.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center rounded-md border border-dashed px-3 py-8 text-center text-bone/28",
                      isTarget && !isSentColumn
                        ? "border-white/30 bg-white/[0.04] text-bone/50"
                        : "border-white/10"
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.16em]">
                      {isSentColumn ? "Sent issues appear here" : "Drop drafts here"}
                    </p>
                  </div>
                ) : (
                  columnItems.map((draft) => (
                    <DraftCard
                      key={draft.id}
                      draft={draft}
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

      {showArchived && archivedDrafts.length > 0 && (
        <section className="mt-8 border-t border-white/10 pt-8">
          <h3 className="text-display mb-4 text-sm uppercase tracking-[0.14em] text-bone/60">
            Archived
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archivedDrafts.map((draft) => (
              <div
                key={draft.id}
                className="grain-overlay rounded-md border border-white/10 bg-warm-charcoal/40 p-4"
              >
                <button
                  type="button"
                  onClick={() => setSelected(draft)}
                  className="w-full text-left"
                >
                  <p className="font-medium tracking-wide text-bone">{draft.title}</p>
                  <p className="mt-1 text-xs text-bone/50">{draft.subject}</p>
                </button>
                <div className="mt-4 flex gap-4 border-t border-white/8 pt-3">
                  <button
                    type="button"
                    onClick={() => handleQuickRestore(draft.id)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-bone/45 transition-colors hover:text-bone"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDelete(draft.id)}
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
        <NewsletterDraftDetailPanel
          draft={selected}
          activeSubscriberCount={activeSubscriberCount}
          onClose={() => setSelected(null)}
          onUpdated={handleDraftUpdated}
          onDeleted={handleDraftRemoved}
          onArchived={(id) => {
            setDrafts((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "archived" } : item
              )
            );
            setSelected(null);
            setShowArchived(true);
          }}
          onSent={handleDraftUpdated}
        />
      )}
    </>
  );
}
