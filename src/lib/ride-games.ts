export type RideGameId = "room" | "street" | "warehouse";

export type RideGame = {
  id: RideGameId;
  title: string;
  tagline: string;
  description: string;
  href: `/${string}`;
  portalLabel: string;
  glyph: string;
  accent: "green" | "amber" | "chrome";
};

/** Player left the bedroom — required to open Street Run. */
export const STREET_UNLOCK_KEY = "kc-street-unlocked";
/** Finished a street run — required to start the alley bike ride. */
export const WAREHOUSE_UNLOCK_KEY = "kc-warehouse-unlocked";
/** Completed the bike ride — required for warehouse hub minigames. */
export const WAREHOUSE_HUB_KEY = "kc-warehouse-hub";

export const CHARACTER_STORAGE_KEY = "kc-ride-character";

export const RIDE_GAMES: RideGame[] = [
  {
    id: "room",
    title: "The Room",
    tagline: "start here",
    description: "Pick a character, explore the bedroom, then head out the door.",
    href: "/ride/room",
    portalLabel: "Wake up",
    glyph: "⌂",
    accent: "green",
  },
];

export function isRidePath(pathname: string) {
  return pathname === "/ride" || pathname.startsWith("/ride/");
}

function ssGet(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function ssSet(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

export function unlockStreetRun() {
  ssSet(STREET_UNLOCK_KEY);
}

export function canPlayStreetRun() {
  return ssGet(STREET_UNLOCK_KEY) === "1";
}

export function unlockWarehouseRide() {
  ssSet(WAREHOUSE_UNLOCK_KEY);
}

export function canEnterWarehouseRide() {
  return ssGet(WAREHOUSE_UNLOCK_KEY) === "1";
}

export function unlockWarehouseHub() {
  ssSet(WAREHOUSE_HUB_KEY);
}

export function canAccessWarehouseHub() {
  return ssGet(WAREHOUSE_HUB_KEY) === "1";
}

export function readStoredCharacter(): "boy" | "girl" | null {
  const saved = ssGet(CHARACTER_STORAGE_KEY);
  return saved === "boy" || saved === "girl" ? saved : null;
}

export function storeCharacter(character: "boy" | "girl") {
  try {
    sessionStorage.setItem(CHARACTER_STORAGE_KEY, character);
  } catch {
    /* ignore */
  }
}
