import Link from "next/link";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo";
import { getAllPosts, getPost } from "@/content/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return createMetadata({ title: "Post Not Found", noIndex: true });
  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-near-black grain-overlay">
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <Link
          href="/blog"
          className="text-xs uppercase tracking-[0.25em] text-bone/45 transition hover:text-muted-gold"
        >
          ← Blog
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-gold">
          {post.category} · {post.publishedAt}
        </p>
        <h1 className="mt-3 text-display text-4xl uppercase leading-none text-bone sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-bone/70">{post.excerpt}</p>

        <div className="mt-10 space-y-5 text-base leading-relaxed text-bone/80 sm:text-lg">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/warehouse"
            className="inline-flex bg-bone px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-near-black transition hover:bg-muted-gold"
          >
            Play in the warehouse
          </Link>
          <Link
            href="/blog"
            className="inline-flex border border-clay/30 px-5 py-3 text-xs uppercase tracking-[0.2em] text-bone/70 transition hover:border-bone hover:text-bone"
          >
            More notes
          </Link>
        </div>
      </article>
    </div>
  );
}
