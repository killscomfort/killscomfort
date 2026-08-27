"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type MutableRefObject,
} from "react";
import { GripVertical, Package, Truck } from "lucide-react";
import {
  updateOrderFulfillmentNotes,
  updateOrderFulfillmentStage,
} from "@/lib/admin/actions";
import {
  FULFILLMENT_STAGES,
  FULFILLMENT_STAGE_HINTS,
  FULFILLMENT_STAGE_LABELS,
  normalizeFulfillmentStage,
} from "@/lib/fulfillment-stage";
import { formatPrice } from "@/lib/merch";
import { formatDate, cn } from "@/lib/utils";
import type { FulfillmentStage } from "@/types/database";

export type ManualOrderLine = {
  product_name: string;
  size: string | null;
  quantity: number;
};

export type ManualOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  fulfillment_stage: FulfillmentStage;
  fulfillment_notes: string | null;
  shipped_at: string | null;
  created_at: string;
  shipping_address: Record<string, string | null>;
  items: ManualOrderLine[];
};

type Props = {
  orders: ManualOrder[];
};

function columnAccentOpacity(index: number) {
  return Math.max(0.35, 0.95 - index * 0.12);
}

/** Whole days an order has been sitting, for the ageing badge. */
function daysSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return 0;
  return Math.floor(ms / 86_400_000);
}

function OrderCard({
  order,
  columnStage,
  draggingId,
  onSelect,
  didDragRef,
  setDraggingId,
  setDropTarget,
  onDropInColumn,
}: {
  order: ManualOrder;
  columnStage: FulfillmentStage;
  draggingId: string | null;
  onSelect: (order: ManualOrder) => void;
  didDragRef: MutableRefObject<boolean>;
  setDraggingId: (id: string | null) => void;
  setDropTarget: (stage: FulfillmentStage | null) => void;
  onDropInColumn: (stage: FulfillmentStage, e: DragEvent) => void;
}) {
  const isDragging = draggingId === order.id;
  const age = daysSince(order.created_at);
  // Anything unshipped for 3+ days gets flagged — the whole point of the board
  // is that a hand-shipped order can't quietly rot.
  const isAging = age >= 3 && order.fulfillment_stage !== "done";

  return (
    <article
      draggable
      onDragStart={(e) => {
        didDragRef.current = true;
        e.dataTransfer.setData("text/order-id", order.id);
        e.dataTransfer.setData("text/plain", order.id);
        e.dataTransfer.effectAllowed = "move";
        setDraggingId(order.id);
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
        setDropTarget(columnStage);
      }}
      onDrop={(e) => onDropInColumn(columnStage, e)}
      onClick={() => {
        if (didDragRef.current) return;
        onSelect(order);
      }}
      className={cn(
        "admin-kanban-card group relative cursor-grab overflow-hidden rounded-md border border-white/10 bg-near-black/80 p-3.5 active:cursor-grabbing",
        "hover:border-white/25",
        isDragging && "scale-[0.98] opacity-40 shadow-none"
      )}
    >
      <div className="flex items-start gap-2.5">
        <GripVertical
          className="mt-0.5 h-4 w-4 shrink-0 text-bone/20 transition-colors group-hover:text-bone/45"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium tracking-wide text-bone">
              {order.order_number}
            </p>
            <span className="shrink-0 text-xs tabular-nums text-bone/60">
              {formatPrice(order.total_cents)}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-bone/55">
            {order.customer_name}
          </p>

          <ul className="mt-2 space-y-0.5">
            {order.items.map((item, i) => (
              <li key={i} className="truncate text-[11px] text-bone/45">
                {item.product_name}
                {item.size ? ` · ${item.size}` : ""} × {item.quantity}
              </li>
            ))}
          </ul>

          {order.fulfillment_notes && (
            <p className="mt-2 truncate text-[10px] uppercase tracking-widest text-moss-green/80">
              {order.fulfillment_notes}
            </p>
          )}

          <div className="mt-2.5 flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-bone/28">
              {formatDate(order.created_at)}
            </p>
            {isAging && (
              <span className="rounded-full border border-dried-blood/40 bg-dried-blood/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-dried-blood">
                {age}d
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function OrdersFulfillmentKanban({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState(() =>
    initialOrders.map((order) => ({
      ...order,
      fulfillment_stage: normalizeFulfillmentStage(order.fulfillment_stage),
    }))
  );
  const [selected, setSelected] = useState<ManualOrder | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<FulfillmentStage | null>(null);
  const [message, setMessage] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const didDragRef = useRef(false);

  // The page is force-dynamic and every action calls revalidatePath, so the
  // server streams fresh props after each change. Without this the lazy
  // useState initializer would throw them away: new Stripe orders arriving
  // during the session would never appear, and a second admin's moves would be
  // invisible until a hard reload. Skipped while a write is in flight so a
  // server render can't stomp the optimistic move.
  useEffect(() => {
    if (isPending) return;
    setOrders(
      initialOrders.map((order) => ({
        ...order,
        fulfillment_stage: normalizeFulfillmentStage(order.fulfillment_stage),
      }))
    );
  }, [initialOrders, isPending]);

  const byStage = useMemo(() => {
    const map = Object.fromEntries(
      FULFILLMENT_STAGES.map((stage) => [stage, [] as ManualOrder[]])
    ) as Record<FulfillmentStage, ManualOrder[]>;

    for (const order of orders) {
      map[normalizeFulfillmentStage(order.fulfillment_stage)].push(order);
    }

    return map;
  }, [orders]);

  const openCount = useMemo(
    () => orders.filter((o) => o.fulfillment_stage !== "done").length,
    [orders]
  );

  function readDraggedOrderId(e: DragEvent) {
    return (
      e.dataTransfer.getData("text/order-id") ||
      e.dataTransfer.getData("text/plain")
    );
  }

  function handleColumnDragOver(stage: FulfillmentStage, e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(stage);
  }

  function handleColumnDragLeave(
    stage: FulfillmentStage,
    e: DragEvent<HTMLElement>
  ) {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDropTarget((current) => (current === stage ? null : current));
  }

  function handleColumnDrop(stage: FulfillmentStage, e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const id = readDraggedOrderId(e);
    if (id) handleDrop(stage, id);
  }

  function handleDrop(stage: FulfillmentStage, orderId: string) {
    const order = orders.find((item) => item.id === orderId);
    if (!order || normalizeFulfillmentStage(order.fulfillment_stage) === stage) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }

    // Optimistic move, rolled back if the server action rejects.
    setOrders((prev) =>
      prev.map((item) =>
        item.id === orderId ? { ...item, fulfillment_stage: stage } : item
      )
    );
    setDraggingId(null);
    setDropTarget(null);

    startTransition(async () => {
      try {
        const result = await updateOrderFulfillmentStage(orderId, stage);
        // Reflect the server-stamped shipped_at so the detail modal shows it
        // without needing a reload.
        setOrders((prev) =>
          prev.map((item) =>
            item.id === orderId
              ? { ...item, fulfillment_stage: stage, shipped_at: result.shipped_at }
              : item
          )
        );
        setSelected((current) =>
          current?.id === orderId
            ? {
                ...current,
                fulfillment_stage: stage,
                shipped_at: result.shipped_at,
              }
            : current
        );
        setMessage("");
      } catch (err) {
        // Roll back only the field this action owns. Restoring the whole
        // snapshot would silently revert a note the user saved while this
        // transition was in flight — a note that IS persisted server-side.
        setOrders((prev) =>
          prev.map((item) =>
            item.id === orderId
              ? { ...item, fulfillment_stage: order.fulfillment_stage }
              : item
          )
        );
        setMessage(
          err instanceof Error
            ? `Could not save move: ${err.message}`
            : "Could not save move. Apply the manual fulfillment migration in Supabase."
        );
      }
    });
  }

  function handleSelect(order: ManualOrder) {
    setSelected(order);
    setNoteDraft(order.fulfillment_notes ?? "");
  }

  function handleSaveNote() {
    if (!selected) return;
    const id = selected.id;
    const value = noteDraft;

    startTransition(async () => {
      try {
        await updateOrderFulfillmentNotes(id, value);
        setOrders((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, fulfillment_notes: value.trim() || null }
              : item
          )
        );
        setSelected((current) =>
          current?.id === id
            ? { ...current, fulfillment_notes: value.trim() || null }
            : current
        );
        setMessage("");
      } catch {
        setMessage("Could not save note.");
      }
    });
  }

  if (orders.length === 0) {
    return (
      <div className="grain-overlay flex flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-warm-charcoal/30 px-6 py-16 text-center">
        <Package className="mb-3 h-6 w-6 text-bone/25" aria-hidden />
        <p className="text-sm uppercase tracking-[0.16em] text-bone/45">
          Nothing to ship
        </p>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-bone/35">
          Orders containing items that don&apos;t route to Printful land here
          automatically when Stripe confirms payment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-warm-charcoal/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-display text-2xl text-bone">{openCount}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-bone/45">
              Awaiting you
            </span>
          </div>
          <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden />
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-bone/40">
            <Truck className="h-3.5 w-3.5" aria-hidden />
            Hand-shipped orders
          </span>
        </div>
      </div>

      {message && (
        <p
          className={cn(
            "mb-4 border px-3 py-2 text-xs uppercase tracking-wider",
            message.startsWith("Could not")
              ? "border-dried-blood/40 bg-dried-blood/10 text-dried-blood"
              : "border-white/10 bg-white/5 text-bone/65"
          )}
        >
          {message}
        </p>
      )}

      <div
        className={cn(
          "admin-kanban-board flex h-[calc(100vh-20rem)] min-h-[460px] gap-3 overflow-x-auto pb-3",
          isPending && "pointer-events-none opacity-80"
        )}
      >
        {FULFILLMENT_STAGES.map((stage, index) => {
          const columnItems = byStage[stage];
          const isTarget = dropTarget === stage;
          const accent = columnAccentOpacity(index);

          return (
            <div
              key={stage}
              style={{ animationDelay: `${index * 60}ms` }}
              className={cn(
                "admin-kanban-column grain-overlay relative flex h-full min-w-[240px] max-w-[300px] flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-warm-charcoal/80 to-near-black/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                isTarget && "admin-kanban-column--target border-white/30"
              )}
              onDragOver={(e) => handleColumnDragOver(stage, e)}
              onDragLeave={(e) => handleColumnDragLeave(stage, e)}
              onDrop={(e) => handleColumnDrop(stage, e)}
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
                      {FULFILLMENT_STAGE_LABELS[stage]}
                    </h3>
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
                      isTarget
                        ? "border-white/30 bg-white/[0.04] text-bone/50"
                        : "border-white/10"
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.16em]">
                      {FULFILLMENT_STAGE_HINTS[stage]}
                    </p>
                  </div>
                ) : (
                  columnItems.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      columnStage={stage}
                      draggingId={draggingId}
                      onSelect={handleSelect}
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="grain-overlay max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/12 bg-warm-charcoal p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-display text-lg uppercase tracking-[0.12em] text-bone">
                  {selected.order_number}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-bone/40">
                  {FULFILLMENT_STAGE_LABELS[
                    normalizeFulfillmentStage(selected.fulfillment_stage)
                  ]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs uppercase tracking-[0.16em] text-bone/45 transition-colors hover:text-bone"
              >
                Close
              </button>
            </div>

            <dl className="mt-5 space-y-2 border-t border-white/8 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-bone/45">Customer</dt>
                <dd className="text-right text-bone">{selected.customer_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-bone/45">Email</dt>
                <dd className="text-right">
                  <a
                    href={`mailto:${selected.customer_email}`}
                    className="text-bone underline decoration-white/20 underline-offset-4"
                  >
                    {selected.customer_email}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-bone/45">Total</dt>
                <dd className="text-right text-bone">
                  {formatPrice(selected.total_cents)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-bone/45">Ordered</dt>
                <dd className="text-right text-bone">
                  {formatDate(selected.created_at)}
                </dd>
              </div>
              {selected.shipped_at && (
                <div className="flex justify-between gap-4">
                  <dt className="text-bone/45">Shipped</dt>
                  <dd className="text-right text-bone">
                    {formatDate(selected.shipped_at)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 border-t border-white/8 pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-bone/45">
                Ship to
              </p>
              <address className="mt-2 text-sm not-italic leading-relaxed text-bone/80">
                {selected.shipping_address.line1}
                {selected.shipping_address.line2 && (
                  <>
                    <br />
                    {selected.shipping_address.line2}
                  </>
                )}
                <br />
                {selected.shipping_address.city},{" "}
                {selected.shipping_address.state}{" "}
                {selected.shipping_address.postal_code}
                <br />
                {selected.shipping_address.country}
              </address>
            </div>

            <div className="mt-5 border-t border-white/8 pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-bone/45">
                Items
              </p>
              <ul className="mt-2 space-y-1 text-sm text-bone/80">
                {selected.items.map((item, i) => (
                  <li key={i}>
                    {item.product_name}
                    {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-white/8 pt-4">
              <label
                htmlFor="fulfillment-note"
                className="text-xs uppercase tracking-[0.16em] text-bone/45"
              >
                Tracking / notes
              </label>
              <textarea
                id="fulfillment-note"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                placeholder="USPS 9400 1000 0000 0000 0000 00"
                className="mt-2 w-full resize-none rounded-md border border-white/12 bg-near-black/60 px-3 py-2 text-sm text-bone placeholder:text-bone/25 focus:border-white/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isPending}
                className="mt-2 rounded-md border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.16em] text-bone/70 transition-colors hover:border-white/30 hover:text-bone disabled:opacity-50"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
