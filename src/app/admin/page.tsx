import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { formatDate } from "@/lib/utils";
import type { Inquiry, Order } from "@/types/database";
import { formatPrice } from "@/lib/merch";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: inquiryCount },
    { count: newInquiryCount },
    { count: orderCount },
    { count: paidOrderCount },
    { count: userCount },
    { count: postCount },
    { count: eventCount },
    { count: musicCount },
    { data: recentInquiries },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("music_entries").select("*", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total Inquiries", value: inquiryCount ?? 0, href: "/admin/inquiries" },
    { label: "New Inquiries", value: newInquiryCount ?? 0, href: "/admin/inquiries?status=new" },
    { label: "Total Orders", value: orderCount ?? 0, href: "/admin/orders" },
    { label: "Paid Orders", value: paidOrderCount ?? 0, href: "/admin/orders?status=paid" },
    { label: "Users", value: userCount ?? 0, href: "/admin/users" },
    { label: "Blog Posts", value: postCount ?? 0, href: "/admin/blog" },
    { label: "Events", value: eventCount ?? 0, href: "/admin/events" },
    { label: "Music Entries", value: musicCount ?? 0, href: "/admin/music" },
  ];

  const recent = (recentInquiries || []) as Inquiry[];
  const orders = (recentOrders || []) as Order[];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Manage site content, inquiries, orders, and users."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <AdminCard className="transition-colors hover:border-muted-gold/40">
              <p className="text-display text-4xl text-muted-gold">{stat.value}</p>
              <p className="mt-2 text-sm text-bone/60">{stat.label}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-display text-xl uppercase text-bone">
            Recent Inquiries
          </h2>
          <Link
            href="/admin/inquiries"
            className="text-sm text-muted-gold hover:text-bone"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {recent.length === 0 ? (
            <p className="text-bone/50">No inquiries yet.</p>
          ) : (
            recent.map((inquiry) => (
              <AdminCard key={inquiry.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-bone">{inquiry.name}</p>
                    <p className="text-sm text-bone/50">
                      {inquiry.event_type} · {formatDate(inquiry.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-widest ${
                      inquiry.status === "new"
                        ? "text-burnt-sienna"
                        : "text-bone/40"
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-display text-xl uppercase text-bone">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-muted-gold hover:text-bone">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-bone/50">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <AdminCard key={order.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-bone">{order.order_number}</p>
                    <p className="text-sm text-bone/50">
                      {order.customer_name} · {formatPrice(order.total_cents)} ·{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-widest ${
                      order.status === "paid" ? "text-moss-green" : "text-burnt-sienna"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      </div>
    </>
  );
}
