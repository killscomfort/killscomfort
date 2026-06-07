import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Inquiry } from "@/types/database";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: inquiries } = await query;
  const items = (inquiries || []) as Inquiry[];

  const statuses = ["all", "new", "read", "responded", "archived"];

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-display text-3xl uppercase text-bone">
              Inquiries
            </h1>
            <Link
              href="/admin"
              className="text-sm text-muted-gold hover:text-bone"
            >
              ← Admin
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <Link
                key={s}
                href={s === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${s}`}
                className={`px-3 py-1.5 text-xs uppercase tracking-widest ${
                  (s === "all" && !status) || status === s
                    ? "bg-muted-gold text-near-black"
                    : "border border-clay/30 text-bone/60"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {items.length === 0 ? (
              <p className="text-bone/50">No inquiries yet.</p>
            ) : (
              items.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="border border-clay/20 bg-warm-charcoal/50 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg text-bone">{inquiry.name}</h3>
                      <p className="text-sm text-bone/60">{inquiry.email}</p>
                    </div>
                    <span
                      className={`text-xs uppercase tracking-widest px-2 py-1 ${
                        inquiry.status === "new"
                          ? "bg-burnt-sienna/20 text-burnt-sienna"
                          : "text-bone/40"
                      }`}
                    >
                      {inquiry.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-bone/70 sm:grid-cols-2">
                    <p>Event: {inquiry.event_type}</p>
                    {inquiry.event_date && (
                      <p>Date: {formatDate(inquiry.event_date)}</p>
                    )}
                    {inquiry.event_location && (
                      <p>Location: {inquiry.event_location}</p>
                    )}
                    {inquiry.budget_range && (
                      <p>Budget: {inquiry.budget_range}</p>
                    )}
                    {inquiry.source && <p>Source: {inquiry.source}</p>}
                  </div>
                  {inquiry.message && (
                    <p className="mt-4 text-sm text-bone/60 border-t border-clay/10 pt-4">
                      {inquiry.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-bone/40">
                    {formatDate(inquiry.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
