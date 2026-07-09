import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { NewsletterAdminTabs } from "@/components/admin/NewsletterAdminTabs";
import { unsubscribeNewsletterSubscriber } from "@/lib/admin/actions";
import { formatDate } from "@/lib/utils";
import type { NewsletterSubscriber } from "@/types/database";

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (status === "unsubscribed") {
    query = query.not("unsubscribed_at", "is", null);
  } else {
    query = query.is("unsubscribed_at", null);
  }

  const [{ count: activeCount }, { count: unsubscribedCount }, { data, error }] =
    await Promise.all([
      supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .is("unsubscribed_at", null),
      supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .not("unsubscribed_at", "is", null),
      query,
    ]);

  const subscribers = (data || []) as NewsletterSubscriber[];
  const filters = [
    { key: "active", label: "Active", count: activeCount ?? 0 },
    { key: "unsubscribed", label: "Unsubscribed", count: unsubscribedCount ?? 0 },
  ];

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description="Manage email subscribers from the site footer signup."
      />

      <NewsletterAdminTabs />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <AdminCard key={filter.key} className="px-5 py-4">
            <p className="text-display text-3xl text-muted-gold">{filter.count}</p>
            <p className="mt-1 text-sm text-bone/60">{filter.label}</p>
          </AdminCard>
        ))}
        </div>
        <Link
          href="/admin/newsletter/drafts"
          className="text-sm text-muted-gold hover:text-bone"
        >
          Manage drafts →
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/newsletter"
          className={`px-3 py-1.5 text-xs uppercase tracking-widest ${
            status !== "unsubscribed"
              ? "bg-muted-gold text-near-black"
              : "border border-clay/30 text-bone/60 hover:text-bone"
          }`}
        >
          Active
        </Link>
        <Link
          href="/admin/newsletter?status=unsubscribed"
          className={`px-3 py-1.5 text-xs uppercase tracking-widest ${
            status === "unsubscribed"
              ? "bg-muted-gold text-near-black"
              : "border border-clay/30 text-bone/60 hover:text-bone"
          }`}
        >
          Unsubscribed
        </Link>
      </div>

      <div className="overflow-x-auto border border-clay/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-clay/20 bg-warm-charcoal/80 text-left text-bone/50">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-dried-blood">
                  Could not load subscribers: {error.message}
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-bone/50">
                  No subscribers in this list yet.
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => {
                const isUnsubscribed = Boolean(subscriber.unsubscribed_at);

                return (
                  <tr key={subscriber.id} className="border-b border-clay/10">
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="text-bone hover:text-muted-gold"
                      >
                        {subscriber.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-bone/70">
                      {subscriber.source || "website"}
                    </td>
                    <td className="px-4 py-3 text-bone/50">
                      {subscriber.utm_campaign || subscriber.utm_source || "—"}
                    </td>
                    <td className="px-4 py-3 text-bone/50">
                      {formatDate(subscriber.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs uppercase tracking-widest ${
                          isUnsubscribed ? "text-bone/40" : "text-moss-green"
                        }`}
                      >
                        {isUnsubscribed ? "Unsubscribed" : "Active"}
                      </span>
                      {isUnsubscribed && subscriber.unsubscribed_at && (
                        <p className="mt-1 text-xs text-bone/35">
                          {formatDate(subscriber.unsubscribed_at)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!isUnsubscribed ? (
                        <DeleteButton
                          action={unsubscribeNewsletterSubscriber}
                          id={subscriber.id}
                          label="Unsubscribe"
                          confirmMessage={`Unsubscribe ${subscriber.email} from the newsletter?`}
                        />
                      ) : (
                        <span className="text-xs text-bone/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
