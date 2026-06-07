import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createLandingPage,
  updateLandingPage,
} from "@/lib/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminCard";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { LandingPage } from "@/types/database";

export default async function AdminLandingPagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: true });

  const items = (pages || []) as LandingPage[];

  return (
    <>
      <AdminPageHeader
        title="Landing Pages"
        description="Ad campaign pages for booking and partnerships."
      />

      <AdminPanel title="Create Landing Page">
        <form action={createLandingPage} className="grid gap-4 sm:grid-cols-2">
          <Input name="slug" label="Slug" placeholder="book-event" required />
          <Select
            name="template"
            label="Template"
            options={["booking", "partnership"]}
            required
          />
          <Input name="headline" label="Headline" required className="sm:col-span-2" />
          <Input name="subheadline" label="Subheadline" className="sm:col-span-2" />
          <Textarea
            name="bullet_points"
            label="Bullet Points (one per line)"
            rows={4}
            className="sm:col-span-2"
          />
          <Input name="testimonial_quote" label="Testimonial Quote" className="sm:col-span-2" />
          <Input name="testimonial_author" label="Testimonial Author" />
          <Input name="cta_text" label="CTA Text" defaultValue="Get Started" />
          <label className="flex items-center gap-2 text-sm text-bone/80 sm:col-span-2">
            <input type="checkbox" name="published" defaultChecked className="accent-muted-gold" />
            Published
          </label>
          <Button type="submit" size="sm" className="sm:col-span-2">
            Create Page
          </Button>
        </form>
      </AdminPanel>

      <div className="mt-10 space-y-8">
        {items.map((page) => (
          <AdminPanel key={page.id} title={`/${page.slug}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-bone/40">
                {page.template} · {page.published ? "Published" : "Draft"}
              </p>
              <Link
                href={`/lp/${page.slug}`}
                target="_blank"
                className="text-sm text-muted-gold hover:text-bone"
              >
                Preview →
              </Link>
            </div>

            <form action={updateLandingPage} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={page.id} />
              <Input
                name="headline"
                label="Headline"
                defaultValue={page.headline}
                required
                className="sm:col-span-2"
              />
              <Input
                name="subheadline"
                label="Subheadline"
                defaultValue={page.subheadline || ""}
                className="sm:col-span-2"
              />
              <Textarea
                name="bullet_points"
                label="Bullet Points (one per line)"
                defaultValue={(page.bullet_points || []).join("\n")}
                rows={4}
                className="sm:col-span-2"
              />
              <Input
                name="testimonial_quote"
                label="Testimonial Quote"
                defaultValue={page.testimonial_quote || ""}
                className="sm:col-span-2"
              />
              <Input
                name="testimonial_author"
                label="Testimonial Author"
                defaultValue={page.testimonial_author || ""}
              />
              <Input
                name="cta_text"
                label="CTA Text"
                defaultValue={page.cta_text}
              />
              <label className="flex items-center gap-2 text-sm text-bone/80 sm:col-span-2">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={page.published}
                  className="accent-muted-gold"
                />
                Published
              </label>
              <Button type="submit" size="sm" variant="outline">
                Save Changes
              </Button>
            </form>
          </AdminPanel>
        ))}
      </div>
    </>
  );
}
