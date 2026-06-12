"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./auth";
import type {
  InquiryStatus,
  LandingTemplate,
  MusicCategory,
  UserRole,
} from "@/types/database";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/users");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/events");
  revalidatePath("/admin/music");
  revalidatePath("/admin/landing-pages");
}

export async function updateInquiryStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as InquiryStatus;

  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidateAdmin();
}

export async function updateInquiryStatusById(id: string, status: InquiryStatus) {
  const supabase = await requireAdmin();
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
