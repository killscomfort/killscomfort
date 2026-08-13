import { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticPages = [
    "",
    "/about",
    "/music",
    "/merch",
    "/services",
    "/events",
    "/book",
    "/donate",
    "/land",
    "/warehouse",
    "/academy",
    "/blog",
    "/typeface",
    "/lp/book-event",
    "/lp/brand-partnership",
    "/lp/miami-dj-for-hire",
  ];

  const blogPosts = ["/blog/curb-runner"];

  return [...staticPages, ...blogPosts].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path.startsWith("/blog") ? 0.7 : 0.8,
  }));
}
