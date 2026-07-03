export const LOGO_SRC = "/killspng dropshadow.png";

/** Canonical brand name — always one word, no spaces */
export const BRAND_NAME = "KillsComfort" as const;

export function normalizeBrandName(text: unknown): string {
  if (text == null) return "";
  const value = typeof text === "string" ? text : String(text);
  return value.replace(/Kills\s+Comfort/gi, BRAND_NAME);
}

export const SITE = {
  name: BRAND_NAME,
  founder: "Gregory Tovar",
  founderRoles: "DJ, producer, and sound engineer",
  founderEducation: "SAE Institute alum",
  tagline: "Growth lives on the otherside of killing your comforts",
  description:
    "Miami-based DJ, producer, sound engineer, SAE Institute alum, and creative visionary building a movement rooted in self-discovery, creative expression, and service to others.",
  location: "Miami, Florida",
  email: "Killscomfort@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://killscomfort.com",
} as const;

/** Base palette from killscomfort.com; accents from inverted hero image */
export const COLORS = {
  nearBlack: "#000000",
  warmCharcoal: "#0E0E0E",
  bone: "#FFFFFF",
  midGray: "#6E6E6E",
  driedBlood: "#CC3B3B",
  mutedGold: "#FFFFFF",
  burntSienna: "#FFFFFF",
  clay: "#FFFFFF",
  desertSand: "#FFFFFF",
  mossGreen: "#FFFFFF",
} as const;

export const EVENT_TYPES = [
  "Club Night",
  "Festival",
  "Private Event",
  "Private Lessons",
  "Corporate",
  "Wedding",
  "Brand Partnership",
  "Other",
] as const;

export const CONTACT_METHODS = ["Email", "Phone"] as const;

export const BUDGET_RANGES = [
  "Under $500",
  "$500-$1500",
  "$1500-$3000",
  "$3000-$5000",
  "$5000+",
  "Prefer to discuss",
] as const;

export const BLOG_CATEGORIES = [
  "Music",
  "Culture",
  "Growth",
  "Miami",
  "Behind the Scenes",
] as const;

export const NAV_LINKS = [
  { href: "/music", label: "Music" },
  { href: "/merch", label: "Merch" },
  { href: "/services", label: "Services" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/donate", label: "Donate" },
  { href: "/book", label: "Book" },
] as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/killscomfort",
  soundcloud: "https://soundcloud.com/killscomfort",
  spotify: "https://open.spotify.com/artist/1C0WKJTNpv2Xli0swIcTE8",
  appleMusic: "https://music.apple.com/us/artist/killscomfort/1729676379",
  deezer: "https://www.deezer.com/artist/253786072",
} as const;
