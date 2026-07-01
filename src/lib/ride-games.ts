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

export const RIDE_GAMES: RideGame[] = [
  {
    id: "room",
    title: "The Room",
    tagline: "pixel life sim",
    description: "Pick a character, wander the room, spin records, and dance to the track.",
    href: "/ride/room",
    portalLabel: "Enter room",
    glyph: "⌂",
    accent: "green",
  },
  {
    id: "street",
    title: "Street Run",
    tagline: "infinite runner",
    description: "Five-lane infinite bike dodge — steer, survive, post your high score.",
    href: "/ride/street",
    portalLabel: "Hit the street",
    glyph: "➤",
    accent: "amber",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    tagline: "miami ride",
    description: "Cut through the alley, roll inside, build a beat, dig crates, find the stash.",
    href: "/ride/warehouse",
    portalLabel: "Roll inside",
    glyph: "▣",
    accent: "chrome",
  },
];

export const CHARACTER_STORAGE_KEY = "kc-ride-character";

export function isRidePath(pathname: string) {
  return pathname === "/ride" || pathname.startsWith("/ride/");
}
