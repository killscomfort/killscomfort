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
  tagline: "Kill the comfort. Keep the movement alive.",
  description:
    "Miami-based DJ, producer, sound engineer, SAE Institute alum, and creative visionary building a movement rooted in self-discovery, creative expression, and service to others.",
  location: "Miami, Florida",
  email: "Killscomfort@gmail.com",
  url: "https://killscomfort.com",
} as const;

/** Base palette from killscomfort.com; accents from inverted hero image */
export const COLORS = {
  nearBlack: "#221d17",
  warmCharcoal: "#f8f1e4",
  bone: "#fffdf7",
  midGray: "#7e7366",
  driedBlood: "#a34d3f",
  mutedGold: "#d7b98e",
  burntSienna: "#c58e64",
  clay: "#d8c4a8",
  desertSand: "#efe2cc",
  mossGreen: "#8f9a78",
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
  { href: "/#story", label: "Story" },
  { href: "/#music", label: "Music" },
  { href: "/#merch", label: "Merch" },
  { href: "/#support", label: "Support" },
  { href: "/#connect", label: "Connect" },
] as const;

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/killscomfort",
  youtube: "https://www.youtube.com/@killscomfort",
  soundcloud: "https://soundcloud.com/killscomfort",
  spotify: "https://open.spotify.com/artist/1C0WKJTNpv2Xli0swIcTE8",
  appleMusic: "https://music.apple.com/us/artist/killscomfort/1729676379",
  deezer: "https://www.deezer.com/artist/253786072",
} as const;
