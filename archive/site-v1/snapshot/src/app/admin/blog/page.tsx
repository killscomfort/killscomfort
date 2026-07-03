import { createClient } from "@/lib/supabase/server";
import { createBlogPost, deleteBlogPost } from "@/lib/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminCard";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (posts || []) as BlogPost[];

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Journal posts for SEO and brand storytelling."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminPanel title="New Post">
          <form action={createBlogPost} className="space-y-4">
            <Input name="title" label="Title" required />
            <Input
              name="slug"
              label="Slug (optional — auto-generated from title)"
            />
            <Input name="category" label="Category" defaultValue="Music" />
            <Textarea name="excerpt" label="Excerpt" rows={2} />
            <Textarea name="content" label="Content" required rows={6} />
            <label className="flex items-center gap-2 text-sm text-bone/80">
              <input type="checkbox" name="published" className="accent-muted-gold" />
              Publish immediately
            </label>
            <Button type="submit" size="sm">
              Create Post
            </Button>
          </form>
        </AdminPanel>

        <div className="space-y-4">
          <h2 className="text-display text-lg uppercase text-bone">
            All Posts ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-bone/50">No posts yet.</p>
          ) : (
            items.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between gap-4 border border-clay/20 bg-warm-charcoal/50 p-4"
              >
                <div>
                  <h3 className="text-bone">{post.title}</h3>
                  <p className="text-xs text-bone/40">
                    /{post.slug} · {post.category} ·{" "}
                    {post.published ? "Published" : "Draft"} ·{" "}
                    {formatDate(post.created_at)}
                  </p>
                </div>
                <DeleteButton action={deleteBlogPost} id={post.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
