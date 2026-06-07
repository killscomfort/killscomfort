import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, category, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-display text-3xl uppercase text-bone">Blog</h1>
            <Link href="/admin" className="text-sm text-muted-gold hover:text-bone">
              ← Admin
            </Link>
          </div>

          <p className="mt-4 text-bone/60">
            Create and manage journal posts. Use the Supabase dashboard or extend
            this page with a create form.
          </p>

          <div className="mt-8 space-y-4">
            {!posts?.length ? (
              <p className="text-bone/50">
                No posts in database. Sample posts are currently static — migrate
                via admin create form or Supabase.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between border border-clay/20 p-4"
                >
                  <div>
                    <h3 className="text-bone">{post.title}</h3>
                    <p className="text-xs text-bone/40">
                      {post.category} — {post.published ? "Published" : "Draft"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
