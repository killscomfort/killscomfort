import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { NewsletterAdminTabs } from "@/components/admin/NewsletterAdminTabs";
import { NewsletterDraftsKanban } from "@/components/admin/NewsletterDraftsKanban";
import { NewsletterDraftActions } from "@/components/admin/NewsletterDraftActions";
import { MIAMI_NEWSLETTER_EVENT_SOURCES } from "@/lib/newsletter-sources";
import { normalizeNewsletterDraftStatus } from "@/lib/newsletter-draft-status";
import type { NewsletterDraft } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterDraftsPage() {
  const supabase = await createClient();

  const [
    { data: drafts, error },
    { count: activeSubscriberCount },
    { count: reviewCount },
  ] = await Promise.all([
    supabase
      .from("newsletter_drafts")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .is("unsubscribed_at", null),
    supabase
      .from("newsletter_drafts")
      .select("*", { count: "exact", head: true })
      .in("status", ["draft", "in_review", "approved"]),
  ]);

  const items = ((drafts || []) as NewsletterDraft[]).map((draft) => ({
    ...draft,
    status: normalizeNewsletterDraftStatus(draft.status),
    source_events: Array.isArray(draft.source_events) ? draft.source_events : [],
  }));

  return (
    <>
      <AdminPageHeader
        title="Newsletter Drafts"
        description="Create → approve → send. Monday cron drafts a Miami roundup; you review here, then post to subscribers."
      />

      <NewsletterAdminTabs />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <AdminCard className="p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-bone/45">
            Instagram sources
          </p>
          <p className="mt-2 text-sm leading-relaxed text-bone/70">
            {MIAMI_NEWSLETTER_EVENT_SOURCES.map((source) => `@${source.handle}`).join(
              " · "
            )}
          </p>
          <p className="mt-3 text-xs text-bone/40">
            Drop new @handles in{" "}
            <code className="text-bone/55">src/lib/newsletter-sources.ts</code> as you
            find more locals.
          </p>
        </AdminCard>

        <div className="flex flex-col gap-3">
          <AdminCard className="px-5 py-4">
            <p className="text-display text-3xl text-muted-gold">{reviewCount ?? 0}</p>
            <p className="mt-1 text-sm text-bone/60">Awaiting review</p>
          </AdminCard>
          <NewsletterDraftActions />
        </div>
      </div>

      {error ? (
        <p className="text-dried-blood">
          Could not load drafts: {error.message}. Apply the{" "}
          <code className="text-sm">20260709_newsletter_drafts</code> migration in Supabase.
        </p>
      ) : items.length === 0 ? (
        <div className="border border-white/10 bg-warm-charcoal/30 px-6 py-10 text-center">
          <p className="text-bone/60">No newsletter drafts yet.</p>
          <p className="mt-2 text-sm text-bone/40">
            Generate a draft from site events, or create a blank one to start writing.
          </p>
        </div>
      ) : (
        <NewsletterDraftsKanban
          drafts={items}
          activeSubscriberCount={activeSubscriberCount ?? 0}
        />
      )}
    </>
  );
}
