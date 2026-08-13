import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { getAllPosts } from "@/content/posts";
import { BrandName } from "@/components/ui/BrandText";

export const metadata = createMetadata({
  title: "Blog",
  description: "Drops, warehouse updates, and notes from KillsComfort.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-near-black grain-overlay">
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-gold">
          <BrandName /> · Blog
        </p>
        <h1 className="mt-3 text-display text-4xl uppercase text-bone sm:text-5xl">
          Notes from the route
        </h1>
        <p className="mt-4 max-w-xl text-bone/65">
          Drops, arcade unlocks, and the work of staying uncomfortable.
        </p>

        <ul className="mt-12 space-y-8">
          {posts.map((post) => (
            <li key={post.slug} className="border-t border-clay/20 pt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-bone/40">
                {post.category} · {post.publishedAt}
              </p>
              <h2 className="mt-2 text-2xl text-bone">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-muted-gold"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-bone/65">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm uppercase tracking-[0.2em] text-muted-gold hover:text-bone"
              >
                Read →
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
