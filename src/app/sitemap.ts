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
    "/lp/book-event",
    "/lp/brand-partnership",
  ];

  return staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
