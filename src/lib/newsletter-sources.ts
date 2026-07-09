/** Instagram and web sources scanned for Miami event listings. */

export type NewsletterEventSource = {
  handle: string;
  label: string;
  url: string;
  category: "brand" | "venue" | "promoter" | "collective";
  notes?: string;
};

/** Add new handles here as you discover local promoters and venues. */
export const MIAMI_NEWSLETTER_EVENT_SOURCES: NewsletterEventSource[] = [
  {
    handle: "killscomfort",
    label: "KillsComfort",
    url: "https://instagram.com/killscomfort",
    category: "brand",
    notes: "Your shows, merch drops, and announcements",
  },
  {
    handle: "toejam808",
    label: "Gregory Tovar",
    url: "https://instagram.com/toejam808",
    category: "brand",
    notes: "Personal account — cross-posts and Miami nightlife",
  },
  {
    handle: "toejambacklot",
    label: "ToeJam Backlot",
    url: "https://instagram.com/toejambacklot",
    category: "venue",
    notes: "150 NW 21st St — MMW, warehouse parties, flex space",
  },
  {
    handle: "wearethemarinaeffect",
    label: "The Marina Effect",
    url: "https://instagram.com/wearethemarinaeffect",
    category: "promoter",
    notes: "Alternative pop fusion collective — live showcases and community events",
  },
  {
    handle: "theboomboxmiami",
    label: "The Boombox Miami",
    url: "https://instagram.com/theboomboxmiami",
    category: "venue",
    notes: "4447 SW 75th Ave — underground experimental music and club culture",
  },
  {
    handle: "artclubforever",
    label: "Art Club",
    url: "https://instagram.com/artclubforever",
    category: "collective",
    notes: "Thursdays 7pm–12am — Art Wars, rotating venues (Boombox, Moksha, etc.)",
  },
  {
    handle: "echodealer",
    label: "Echodealer",
    url: "https://instagram.com/echodealer",
    category: "promoter",
    notes: "Miami UG music scene — wet raves, experimental lineups",
  },
  {
    handle: "theandrewhouse",
    label: "Andrew House",
    url: "https://instagram.com/theandrewhouse",
    category: "venue",
    notes: "Local house — parties and community events",
  },
  {
    handle: "churchills_pub",
    label: "Churchill's Pub",
    url: "https://instagram.com/churchills_pub",
    category: "venue",
    notes: "5501 NE 2nd Ave, Little Haiti — punk, hardcore, metal, live shows",
  },
  {
    handle: "lasrosasmiami",
    label: "Las Rosas",
    url: "https://instagram.com/lasrosasmiami",
    category: "venue",
    notes: "2898 NW 7th Ave, Allapattah — dive bar, local bands, pool",
  },
];

export function getNewsletterSourceByHandle(handle: string) {
  const normalized = handle.replace(/^@/, "").toLowerCase();
  return MIAMI_NEWSLETTER_EVENT_SOURCES.find(
    (source) => source.handle.toLowerCase() === normalized
  );
}

export function formatNewsletterSourceList() {
  return MIAMI_NEWSLETTER_EVENT_SOURCES.map(
    (source) => `@${source.handle} (${source.label})`
  ).join(", ");
}
