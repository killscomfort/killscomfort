import Link from "next/link";
import { getAdminServiceClient } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/lib/merch";
import type { Order, OrderItem } from "@/types/database";

type OrderWithItems = Order & { order_items: OrderItem[] };

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
        description="Merch checkout and booking payments from PayPal."
      />

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
