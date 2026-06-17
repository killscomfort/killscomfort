import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { formatDate } from "@/lib/utils";
import type { NewsletterSubscriber } from "@/types/database";

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const [{ count }, { data, error }] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const subscribers = (data || []) as NewsletterSubscriber[];

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description="Email subscribers from the site footer signup."
      />

      <AdminCard className="mb-6 inline-block px-5 py-4">
        <p className="text-display text-3xl text-muted-gold">{count ?? 0}</p>
        <p className="mt-1 text-sm text-bone/60">Total subscribers</p>
      </AdminCard>

      <div className="overflow-x-auto border border-clay/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-clay/20 bg-warm-charcoal/80 text-left text-bone/50">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-dried-blood">
                  Could not load subscribers: {error.message}
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-bone/50">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
