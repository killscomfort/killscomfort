export type MinigameCardRarity = "common" | "uncommon" | "rare" | "legendary";

export type MinigameCardAccent = "chrome" | "amber" | "blood" | "bone" | "green";

export type MinigameCard = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  href: string;
  rarity: MinigameCardRarity;
  accent: MinigameCardAccent;
  /** Index label on the warehouse floor */
  index?: string;
};

export type MinigameLaunch = {
  initialScene: "enter" | "hub";
  initialPanel: "beat" | "dig" | "mixes" | "wall" | null;
};

export const MINIGAME_CARDS: MinigameCard[] = [
  {
    id: "roll-in",
    title: "Roll In",
    subtitle: "Alley run to the doors",
    tag: "RIDE",
    image: "/cards/roll-in.svg",
    href: "/ride/warehouse?game=roll-in",
    rarity: "legendary",
    accent: "chrome",
    index: "00",
  },
  {
    id: "cassette",
    title: "Open Cassette",
    subtitle: "Build a beat on the floor",
    tag: "BEAT LAB",
    image: "/cards/cassette.svg",
    href: "/ride/warehouse?game=cassette",
    rarity: "uncommon",
    accent: "amber",
    index: "01",
  },
  {
    id: "crates",
    title: "Dig The Crates",
    subtitle: "Flip sleeves, pull the gem",
    tag: "CRATE DIG",
    image: "/cards/crates.svg",
    href: "/ride/warehouse?game=crates",
    rarity: "rare",
    accent: "chrome",
    index: "02",
  },
  {
    id: "mixes",
    title: "Secret Mixes",
    subtitle: "Unlock what you earned",
    tag: "VAULT",
    image: "/cards/mixes.svg",
    href: "/ride/warehouse?game=mixes",
    rarity: "rare",
    accent: "bone",
    index: "03",
  },
  {
    id: "wall",
    title: "Community Wall",
    subtitle: "Leave a mark inside",
    tag: "WALL TAG",
    image: "/cards/wall.svg",
    href: "/ride/warehouse?game=wall",
    rarity: "common",
    accent: "blood",
    index: "04",
  },
];

export const ARCADE_CARDS: MinigameCard[] = [
  {
    id: "room",
    title: "The Room",
    subtitle: "Pixel life sim — spin records, dance",
    tag: "LIFE SIM",
    image: "/cards/room.svg",
    href: "/ride/room",
    rarity: "rare",
    accent: "green",
    index: "01",
  },
  {
    id: "street",
    title: "Street Run",
    subtitle: "Five-lane infinite bike dodge",
    tag: "RUNNER",
    image: "/cards/street.svg",
    href: "/ride/street",
    rarity: "uncommon",
    accent: "amber",
    index: "02",
  },
  {
    id: "warehouse",
    title: "Warehouse",
    subtitle: "Full deck — roll in and dig crates",
    tag: "MIAMI RIDE",
    image: "/cards/warehouse.svg",
    href: "/ride/warehouse",
    rarity: "legendary",
    accent: "chrome",
    index: "03",
  },
];

const LAUNCH_MAP: Record<string, MinigameLaunch> = {
  "roll-in": { initialScene: "enter", initialPanel: null },
  cassette: { initialScene: "hub", initialPanel: "beat" },
  crates: { initialScene: "hub", initialPanel: "dig" },
  mixes: { initialScene: "hub", initialPanel: "mixes" },
  wall: { initialScene: "hub", initialPanel: "wall" },
};

export function getMinigameCard(id: string): MinigameCard | undefined {
  return MINIGAME_CARDS.find((card) => card.id === id);
}

export function getMinigameLaunch(id: string): MinigameLaunch | undefined {
  return LAUNCH_MAP[id];
}
