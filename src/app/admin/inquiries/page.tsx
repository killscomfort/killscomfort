import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { InquiryStatusSelect } from "@/components/admin/InquiryStatusSelect";
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
    <>
      <AdminPageHeader
        title="Inquiries"
        description="Booking requests from the website and landing pages."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${s}`}
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
        {items.length === 0 ? (
          <p className="text-bone/50">No inquiries yet.</p>
        ) : (
          items.map((inquiry) => (
            <AdminCard key={inquiry.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg text-bone">{inquiry.name}</h3>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-sm text-muted-gold hover:text-bone"
                  >
                    {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <p className="text-sm text-bone/50">{inquiry.phone}</p>
                  )}
                </div>
                <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-bone/70 sm:grid-cols-2 lg:grid-cols-3">
                <p>Event: {inquiry.event_type}</p>
                {inquiry.preferred_contact && (
                  <p>Contact via: {inquiry.preferred_contact}</p>
                )}
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
                {inquiry.utm_source && (
                  <p>
                    UTM: {inquiry.utm_source}
                    {inquiry.utm_medium ? ` / ${inquiry.utm_medium}` : ""}
                  </p>
                )}
              </div>

              {inquiry.message && (
                <p className="mt-4 border-t border-clay/10 pt-4 text-sm text-bone/60">
                  {inquiry.message}
                </p>
              )}

              <p className="mt-3 text-xs text-bone/40">
                Submitted {formatDate(inquiry.created_at)}
              </p>
            </AdminCard>
          ))
        )}
      </div>
    </>
  );
}
