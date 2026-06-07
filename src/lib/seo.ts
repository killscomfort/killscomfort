import { Metadata } from "next";
import { SITE } from "@/lib/constants";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function createMetadata({
  title,
  description = SITE.description,
  path = "",
  image,
  noIndex = false,
}: SEOProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const url = `${SITE.url}${path}`;
  const ogImage = image || `${SITE.url}/og-default.jpg`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      locale: "en_US",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function artistJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    founder: {
      "@type": "Person",
      name: SITE.founder,
      jobTitle: "DJ & Producer",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Miami",
      addressRegion: "FL",
      addressCountry: "US",
    },
    genre: ["House", "Techno", "Hip-Hop", "Electronic"],
    sameAs: [
      "https://instagram.com/killscomfort",
      "https://soundcloud.com/killscomfort",
      "https://open.spotify.com/artist/1C0WKJTNpv2Xli0swIcTE8",
      "https://music.apple.com/us/artist/killscomfort/1729676379",
      "https://www.deezer.com/artist/253786072",
    ],
  };
}
