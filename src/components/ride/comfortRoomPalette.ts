export type CharacterType = "boy" | "girl";

export const W = 384;
export const H = 240;
export const TILE = 16;

export const ROOM = { x0: 2, y0: 2, x1: 22, y1: 13 };

export const PAL = {
  floor: "#2b2622",
  floorAlt: "#322c27",
  wall: "#1a1714",
  wallShadow: "#100e0c",
  rug: "#5a3a32",
  rugAlt: "#6b463c",
  wood: "#4a3526",
  woodDark: "#372618",
  skinB: "#caa078",
  skinG: "#d8ad82",
  hairB: "#241c16",
  hairG: "#3a2418",
  shirtB: "#3a4a52",
  shirtG: "#8a4a5a",
  pants: "#222018",
  vinylBody: "#1c1c1c",
  vinylLabel: "#c43a3a",
  pcBody: "#3a3a3e",
  pcScreen: "#7adfc0",
  bookA: "#7a3a30",
  bookB: "#2f5a4a",
  bookC: "#5a4a8a",
  bedFrame: "#3a2a1c",
  bedSheet: "#445566",
  bedPillow: "#cfc8b8",
  doorWood: "#5a3c26",
} as const;

export type RoomObject = {
  id: string;
  tx: number;
  ty: number;
  w: number;
  h: number;
  label: string;
  title: string;
  text: string;
};

export const OBJECTS: RoomObject[] = [
  {
    id: "vinyl",
    tx: 4,
    ty: 4,
    w: 2,
    h: 1,
    label: "records",
    title: "the record player",
    text: "A worn vinyl spins. Side scratches like a held breath. Something about the bassline keeps you here a little longer than you meant to stay.",
  },
  {
    id: "pc",
    tx: 18,
    ty: 4,
    w: 2,
    h: 2,
    label: "harddrive",
    title: "old harddrive",
    text: "Folders full of half-finished demos, voice memos, screenshots of things you meant to remember. You dont open all of them. Not tonight.",
  },
  {
    id: "books",
    tx: 4,
    ty: 9,
    w: 3,
    h: 1,
    label: "books",
    title: "the shelf",
    text: "Spines cracked from re-reading. One book is dog-eared at the same page every time, like youre still looking for an answer that changes.",
  },
  {
    id: "bed",
    tx: 14,
    ty: 9,
    w: 5,
    h: 3,
    label: "rest",
    title: "dream state",
    text: "You lie back and the ceiling dissolves. For a while there is no room, no noise — just the slow tide of sleep pulling you under.",
  },
  {
    id: "door",
    tx: 11,
    ty: 13,
    w: 2,
    h: 1,
    label: "leave",
    title: "outside",
    text: "The door creaks open onto the street. Your bike is leaning right where you left it.",
  },
];
