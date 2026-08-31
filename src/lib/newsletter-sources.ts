/** Instagram and web sources scanned for Miami event listings. */

export type NewsletterSourceCategory =
  | "brand"
  | "venue"
  | "promoter"
  | "collective"
  | "fitness"
  | "art"
  | "community"
  | "market"
  | "radio"
  | "listings";

export type NewsletterEventSource = {
  /** Instagram handle, when the source is an IG account. Web-only sources omit it. */
  handle?: string;
  label: string;
  url: string;
  category: NewsletterSourceCategory;
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
  {
    label: "Club Space",
    url: "https://clubspace.com",
    category: "venue",
    notes: "Downtown — featured in the Aug 18 issue",
  },
  {
    label: "LIV",
    url: "https://www.livnightclub.com/miami/events/",
    category: "venue",
    notes: "Public events calendar — featured in the Aug 18 issue",
  },
  {
    handle: "freeyogamiami",
    label: "Free Yoga Miami",
    url: "https://instagram.com/freeyogamiami",
    category: "fitness",
    notes: "Wed 6:30pm & Sun 5pm, Margaret Pace Park — featured in the Aug 18 issue",
  },
  {
    label: "YO BK",
    url: "https://yo-bk.com/miami",
    category: "fitness",
    notes: "Hot yoga + pilates, Oasis Wynwood — featured in the Aug 18 issue",
  },
  // TODO — art, community, market, radio and listings sources. Do not guess
  // handles; a wrong @ in a newsletter is worse than an absent one.
];

export function getNewsletterSourceByHandle(handle: string) {
  const normalized = handle.replace(/^@/, "").toLowerCase();
  return MIAMI_NEWSLETTER_EVENT_SOURCES.find(
    (source) => (source.handle ?? "").toLowerCase() === normalized
  );
}

export function formatNewsletterSourceList() {
  return MIAMI_NEWSLETTER_EVENT_SOURCES.map((source) =>
    source.handle ? `@${source.handle} (${source.label})` : source.label
  ).join(", ");
}
