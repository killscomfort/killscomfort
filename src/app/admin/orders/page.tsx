import Link from "next/link";
import { getAdminServiceClient } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  OrdersFulfillmentKanban,
  type ManualOrder,
} from "@/components/admin/OrdersFulfillmentKanban";
import { normalizeFulfillmentStage } from "@/lib/fulfillment-stage";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/lib/merch";
import type { Order, OrderItem } from "@/types/database";

type OrderWithItems = Order & { order_items: OrderItem[] };

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await getAdminServiceClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query;
  const items = (orders || []) as OrderWithItems[];

  // Hand-shipped orders (anything without a Printful route) get their own board.
  // Read from the full list rather than the filtered query so the pack queue
  // doesn't disappear when a status filter is applied.
  const { data: manualRows, error: manualError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("requires_manual_fulfillment", true)
    .order("created_at", { ascending: false });

  // If this query fails (most likely: the migration hasn't been applied and the
  // column doesn't exist), manualRows is null and the board renders its
  // "Nothing to ship" empty state — indistinguishable from a genuinely clear
  // queue. The entire point of this board is that hand-shipped orders can't go
  // unnoticed, so surface the failure instead of swallowing it.
  if (manualError) {
    console.error("[admin/orders] manual fulfillment query failed", manualError);
  }

  const manualOrders: ManualOrder[] = ((manualRows || []) as OrderWithItems[]).map(
    (order) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      total_cents: order.total_cents,
      fulfillment_stage: normalizeFulfillmentStage(order.fulfillment_stage),
      fulfillment_notes: order.fulfillment_notes,
      shipped_at: order.shipped_at,
      created_at: order.created_at,
      shipping_address: order.shipping_address,
      items: (order.order_items || []).map((item) => ({
        product_name: item.product_name,
        size: item.size,
        quantity: item.quantity,
      })),
    })
  );

  const statuses = ["all", "pending", "paid", "failed", "cancelled", "refunded"];

  function statusColor(orderStatus: string) {
    switch (orderStatus) {
      case "paid":
        return "text-moss-green";
      case "pending":
        return "text-burnt-sienna";
      case "failed":
        return "text-dried-blood";
      default:
        return "text-bone/40";
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Merch and booking payments from Stripe and PayPal."
      />

      <section className="mb-12">
        <h2 className="text-display mb-1 text-sm uppercase tracking-[0.14em] text-bone">
          Ship It Yourself
        </h2>
        <p className="mb-4 text-xs text-bone/40">
          Orders with items that don&apos;t route to Printful. Drag a card as you
          pack and ship it.
        </p>
        {manualError ? (
          <div className="border border-dried-blood/40 bg-dried-blood/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-dried-blood">
              Fulfillment board unavailable — this is not an empty queue
            </p>
            <p className="mt-2 text-xs leading-relaxed text-bone/60">
              {manualError.message}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-bone/40">
              If this mentions a missing column, apply{" "}
              <code className="text-bone/70">
                supabase/migrations/20260820_manual_fulfillment_kanban.sql
              </code>
              .
            </p>
          </div>
        ) : (
          <OrdersFulfillmentKanban orders={manualOrders} />
        )}
      </section>

      <h2 className="text-display mb-4 text-sm uppercase tracking-[0.14em] text-bone">
        All Orders
      </h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`px-3 py-1.5 text-xs uppercase tracking-widest ${
              (s === "all" && !status) || status === s
                ? "bg-muted-gold text-near-black"
                : "border border-clay/30 text-bone/60 hover:text-bone"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {error && (
          <p className="text-sm text-dried-blood">
            Could not load orders: {error.message}
          </p>
        )}
        {!error && items.length === 0 ? (
          <p className="text-bone/50">No orders yet.</p>
        ) : (
          items.map((order) => {
            const shipping = order.shipping_address as {
              line1: string;
              line2?: string | null;
              city: string;
              state: string;
              postal_code: string;
              country: string;
              event_date?: string | null;
              event_notes?: string | null;
            };
            const isServiceOrder = shipping.line1.includes("Service order");

            return (
              <AdminCard key={order.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg text-bone">{order.order_number}</h3>
                    <p className="text-sm text-muted-gold">{formatPrice(order.total_cents)}</p>
                    <p className="mt-1 text-sm text-bone/50">{formatDate(order.created_at)}</p>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-widest ${statusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-bone/70 sm:grid-cols-2">
                  <div>
                    <p className="text-bone">{order.customer_name}</p>
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="text-muted-gold hover:text-bone"
                    >
                      {order.customer_email}
                    </a>
                    {order.customer_phone && <p>{order.customer_phone}</p>}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-bone/40">
                      {isServiceOrder ? "Booking details" : "Ship to"}
                    </p>
                    {!isServiceOrder && (
                      <>
                        <p>{shipping.line1}</p>
                        {shipping.line2 && <p>{shipping.line2}</p>}
                        <p>
                          {shipping.city}, {shipping.state} {shipping.postal_code}
                        </p>
                      </>
                    )}
                    {shipping.event_date && <p>Event date: {shipping.event_date}</p>}
                    {shipping.event_notes && <p>{shipping.event_notes}</p>}
                  </div>
                </div>

                <ul className="mt-4 space-y-1 border-t border-clay/20 pt-4 text-sm text-bone/70">
                  {(order.order_items ?? []).map((line) => (
                    <li key={line.id}>
                      {line.product_name}
                      {line.size ? ` (${line.size})` : ""} × {line.quantity} —{" "}
                      {formatPrice(line.price_cents * line.quantity)}
                    </li>
                  ))}
                </ul>
              </AdminCard>
            );
          })
        )}
      </div>
    </>
  );
}
