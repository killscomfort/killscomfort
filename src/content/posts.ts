export type BlogPostContent = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  body: string[];
};

export const POSTS: BlogPostContent[] = [
  {
    slug: "curb-runner",
    title: "Curb Runner hits the warehouse arcade",
    excerpt:
      "Hop curbs, dodge potholes, and land zines on lit porches — the new cabinet game is live inside /warehouse.",
    category: "Behind the Scenes",
    publishedAt: "2026-08-13",
    body: [
      "Curb Runner is live in the warehouse arcade.",
      "Ride a continuous night route, hop the curb, dodge potholes, and throw zines at glowing porches. Lit houses are subscribers. Dark ones are not. Gold-band throws pay more and build a streak.",
      "Find the arcade cabinet downstairs in the warehouse, pick Curb Runner, and play in the cabinet. Keyboard and touch both work.",
      "Motion is faith. Keep killing comfort — and keep the route moving.",
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((post) => post.slug === slug) ?? null;
}

export function getAllPosts() {
  return [...POSTS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
