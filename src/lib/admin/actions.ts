"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { requireAdmin, getAdminClient, getAdminServiceClient } from "./auth";
import type {
  InquiryStatus,
  LandingTemplate,
  MusicCategory,
  NewsletterDraftStatus,
  UserRole,
} from "@/types/database";
import { rideGameConfigSchema, type RideGameConfig } from "@/lib/game-config";
import { saveRideGameConfig } from "@/lib/game-config-db";
import {
  buildDraftHtmlFromEvents,
  buildSourceEventFromDbEvent,
  defaultDraftSubject,
  defaultDraftTitle,
  sendNewsletterDraftReadyNotification,
  sendNewsletterDraftToSubscribers,
} from "@/lib/newsletter-drafts";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/users");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/events");
  revalidatePath("/admin/music");
  revalidatePath("/admin/landing-pages");
  revalidatePath("/admin/traffic");
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter/drafts");
  revalidatePath("/admin/games");
  revalidatePath("/api/game/config");
}

export async function updateInquiryStatus(formData: FormData) {
  await requireAdmin();
  const supabase = await getAdminServiceClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as InquiryStatus;

  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateInquiryStatusById(id: string, status: InquiryStatus) {
  await requireAdmin();
  const supabase = await getAdminServiceClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateInquiry(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as InquiryStatus;
  const eventDate = String(formData.get("event_date") || "").trim();

  const { error } = await supabase
    .from("inquiries")
    .update({
      status,
      phone: String(formData.get("phone") || "").trim() || null,
      preferred_contact: String(formData.get("preferred_contact") || "").trim() || null,
      event_type: String(formData.get("event_type")).trim(),
      event_date: eventDate || null,
      event_location: String(formData.get("event_location") || "").trim() || null,
      budget_range: String(formData.get("budget_range") || "").trim() || null,
      message: String(formData.get("message") || "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function deleteInquiry(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function archiveInquiryById(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("inquiries")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function restoreInquiryById(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("inquiries")
    .update({ status: "new" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function archiveOldInquiries(): Promise<{ archived: number }> {
  const supabase = await requireAdmin();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90); // matches ARCHIVE_OLD_INQUIRIES_DAYS

  const { data, error } = await supabase
    .from("inquiries")
    .update({ status: "archived" })
    .neq("status", "archived")
    .lt("created_at", cutoff.toISOString())
    .select("id");

  if (error) throw new Error(error.message);
  revalidateAdmin();
  return { archived: data?.length ?? 0 };
}

export async function unsubscribeNewsletterSubscriber(formData: FormData) {
  const supabase = await getAdminServiceClient();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", id)
    .is("unsubscribed_at", null);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateUserRole(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as UserRole;

  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidateAdmin();
}

export async function createBlogPost(formData: FormData) {
  const supabase = await requireAdmin();
  const title = String(formData.get("title")).trim();
  const slug = slugify(String(formData.get("slug") || title));
  const published = formData.get("published") === "on";

  await supabase.from("blog_posts").insert({
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    content: String(formData.get("content")).trim(),
    category: String(formData.get("category") || "Music").trim(),
    published,
    published_at: published ? new Date().toISOString() : null,
  });

  revalidateAdmin();
}

export async function deleteBlogPost(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("blog_posts").delete().eq("id", String(formData.get("id")));
  revalidateAdmin();
}

export async function createEvent(formData: FormData) {
  const supabase = await requireAdmin();
  const published = formData.get("published") === "on";
  const eventDate = String(formData.get("event_date") || "").trim();

  await supabase.from("events").insert({
    title: String(formData.get("title")).trim(),
    venue: String(formData.get("venue") || "").trim() || null,
    event_date: eventDate || null,
    category: String(formData.get("category") || "club").trim(),
    description: String(formData.get("description") || "").trim() || null,
    cover_image: String(formData.get("cover_image") || "").trim() || null,
    published,
  });

  revalidateAdmin();
}

export async function deleteEvent(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("events").delete().eq("id", String(formData.get("id")));
  revalidateAdmin();
}

export async function createMusicEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  await supabase.from("music_entries").insert({
    title: String(formData.get("title")).trim(),
    category: String(formData.get("category")) as MusicCategory,
    platform: String(formData.get("platform") || "soundcloud").trim(),
    embed_url: String(formData.get("embed_url") || "").trim() || null,
    external_url: String(formData.get("external_url") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    featured,
    published,
  });

  revalidateAdmin();
}

export async function deleteMusicEntry(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("music_entries").delete().eq("id", String(formData.get("id")));
  revalidateAdmin();
}

export async function updateLandingPage(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const bullets = String(formData.get("bullet_points") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const published = formData.get("published") === "on";

  await supabase
    .from("landing_pages")
    .update({
      headline: String(formData.get("headline")).trim(),
      subheadline: String(formData.get("subheadline") || "").trim() || null,
      bullet_points: bullets,
      testimonial_quote:
        String(formData.get("testimonial_quote") || "").trim() || null,
      testimonial_author:
        String(formData.get("testimonial_author") || "").trim() || null,
      cta_text: String(formData.get("cta_text") || "Get Started").trim(),
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidateAdmin();
}

export async function createLandingPage(formData: FormData) {
  const supabase = await requireAdmin();
  const bullets = String(formData.get("bullet_points") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const published = formData.get("published") === "on";

  await supabase.from("landing_pages").insert({
    slug: slugify(String(formData.get("slug")).trim()),
    template: String(formData.get("template")) as LandingTemplate,
    headline: String(formData.get("headline")).trim(),
    subheadline: String(formData.get("subheadline") || "").trim() || null,
    bullet_points: bullets,
    testimonial_quote:
      String(formData.get("testimonial_quote") || "").trim() || null,
    testimonial_author:
      String(formData.get("testimonial_author") || "").trim() || null,
    cta_text: String(formData.get("cta_text") || "Get Started").trim(),
    published,
  });

  revalidateAdmin();
}

export async function deleteStreetRunScore(formData: FormData) {
  await requireAdmin();
  const supabase = await getAdminServiceClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("street_run_scores").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function deleteStreetRunScoresForEmail(formData: FormData) {
  await requireAdmin();
  const supabase = await getAdminServiceClient();
  const email = String(formData.get("email")).toLowerCase().trim();

  const { error } = await supabase.from("street_run_scores").delete().eq("email", email);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function clearStreetRunLeaderboard() {
  await requireAdmin();
  const supabase = await getAdminServiceClient();
  const { error } = await supabase.from("street_run_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateRideGameConfig(config: RideGameConfig) {
  await requireAdmin();
  const parsed = rideGameConfigSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid game config");
  }

  const supabase = await getAdminServiceClient();
  await saveRideGameConfig(supabase, parsed.data);
  revalidateAdmin();
}


export async function updateNewsletterDraftStatusById(
  id: string,
  status: NewsletterDraftStatus
) {
  const supabase = await getAdminClient();
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved") {
    updates.approved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("newsletter_drafts")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateNewsletterDraft(formData: FormData) {
  const supabase = await getAdminClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as NewsletterDraftStatus;

  const { error } = await supabase
    .from("newsletter_drafts")
    .update({
      title: String(formData.get("title")).trim(),
      subject: String(formData.get("subject")).trim(),
      preheader: String(formData.get("preheader") || "").trim() || null,
      content_html: String(formData.get("content_html") || ""),
      status,
      updated_at: new Date().toISOString(),
      ...(status === "approved"
        ? { approved_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function createNewsletterDraft(formData: FormData) {
  const supabase = await getAdminClient();
  const title = String(formData.get("title") || defaultDraftTitle()).trim();
  const subject = String(formData.get("subject") || defaultDraftSubject()).trim();

  const { error } = await supabase.from("newsletter_drafts").insert({
    title,
    subject,
    preheader: "Miami events, shows, and culture this week.",
    content_html: emailParagraphPlaceholder(),
    status: "draft",
  });

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

function emailParagraphPlaceholder() {
  return `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#ffffff;opacity:0.88;">Start writing your weekly Miami events roundup here.</p>`;
}

export async function generateNewsletterDraftFromEvents() {
  const supabase = await getAdminClient();
  const today = new Date();
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 14);

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .gte("event_date", today.toISOString().slice(0, 10))
    .lte("event_date", horizon.toISOString().slice(0, 10))
    .order("event_date", { ascending: true });

  if (eventsError) throw new Error(eventsError.message);

  const sourceEvents = (events || []).map(buildSourceEventFromDbEvent);
  const title = defaultDraftTitle();
  const subject = defaultDraftSubject();
  const contentHtml = buildDraftHtmlFromEvents(sourceEvents);

  const { data: inserted, error } = await supabase
    .from("newsletter_drafts")
    .insert({
      title,
      subject,
      preheader: "Miami events, shows, and culture this week.",
      content_html: contentHtml,
      source_events: sourceEvents,
      status: "draft",
    })
    .select("id, title, subject")
    .single();

  if (error || !inserted) throw new Error(error?.message || "Failed to create draft");

  await sendNewsletterDraftReadyNotification(inserted);
  revalidateAdmin();
  return { id: inserted.id };
}

export async function archiveNewsletterDraftById(id: string) {
  const supabase = await getAdminClient();
  const { error } = await supabase
    .from("newsletter_drafts")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function restoreNewsletterDraftById(id: string) {
  const supabase = await getAdminClient();
  const { error } = await supabase
    .from("newsletter_drafts")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function deleteNewsletterDraft(id: string) {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("newsletter_drafts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function sendNewsletterDraft(id: string) {
  const supabase = await getAdminClient();

  const { data: draft, error: draftError } = await supabase
    .from("newsletter_drafts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (draftError || !draft) {
    throw new Error(draftError?.message || "Draft not found");
  }

  if (draft.status === "sent") {
    throw new Error("This newsletter has already been sent.");
  }

  const { data: subscribers, error: subscribersError } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .is("unsubscribed_at", null);

  if (subscribersError) throw new Error(subscribersError.message);

  const { sentCount } = await sendNewsletterDraftToSubscribers(
    {
      subject: draft.subject,
      preheader: draft.preheader,
      content_html: draft.content_html,
    },
    subscribers || []
  );

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("newsletter_drafts")
    .update({
      status: "sent",
      sent_at: now,
      approved_at: draft.approved_at || now,
      sent_count: sentCount,
      updated_at: now,
    })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);
  revalidateAdmin();
  return { sentCount };
}
