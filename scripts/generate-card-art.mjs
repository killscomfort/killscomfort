import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "cards");

const cards = [
  {
    slug: "play",
    label: "PLAY",
    tag: "ARCADE",
    glyph: "✦",
    bg: ["#101014", "#050508"],
    accent: "#e7e7ec",
  },
  {
    slug: "roll-in",
    label: "ROLL IN",
    tag: "RIDE",
    glyph: "➤",
    bg: ["#101014", "#050508"],
    accent: "#e7e7ec",
  },
  {
    slug: "cassette",
    label: "CASSETTE",
    tag: "BEAT LAB",
    glyph: "▣",
    bg: ["#14110c", "#080604"],
    accent: "#d4a853",
  },
  {
    slug: "crates",
    label: "CRATES",
    tag: "CRATE DIG",
    glyph: "▤",
    bg: ["#101010", "#050505"],
    accent: "#d8d8de",
  },
  {
    slug: "mixes",
    label: "VAULT",
    tag: "SECRET MIX",
    glyph: "◎",
    bg: ["#0c1014", "#040608"],
    accent: "#c7d0dc",
  },
  {
    slug: "wall",
    label: "WALL",
    tag: "TAG",
    glyph: "✦",
    bg: ["#140c0c", "#080404"],
    accent: "#c45c5c",
  },
  {
    slug: "room",
    label: "THE ROOM",
    tag: "LIFE SIM",
    glyph: "⌂",
    bg: ["#0c120e", "#040806"],
    accent: "#8fd4a8",
  },
  {
    slug: "street",
    label: "STREET RUN",
    tag: "RUNNER",
    glyph: "⟫",
    bg: ["#12100c", "#060504"],
    accent: "#d4a853",
  },
  {
    slug: "warehouse",
    label: "WAREHOUSE",
    tag: "MIAMI RIDE",
    glyph: "▧",
    bg: ["#101014", "#050508"],
    accent: "#e7e7ec",
  },
];

function svg(card) {
  const [top, bottom] = card.bg;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700" viewBox="0 0 500 700">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="${top}"/>
      <stop offset="100%" stop-color="${bottom}"/>
    </linearGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="rgba(255,255,255,0.03)"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="38%" r="42%">
      <stop offset="0%" stop-color="${card.accent}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${card.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="500" height="700" fill="url(#bg)"/>
  <rect width="500" height="700" fill="url(#glow)"/>
  <rect width="500" height="700" fill="url(#scan)"/>
  <rect x="22" y="22" width="456" height="656" fill="none" stroke="${card.accent}" stroke-opacity="0.22" stroke-width="2"/>
  <rect x="34" y="34" width="432" height="632" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <line x1="34" y1="560" x2="466" y2="560" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="250" y="300" text-anchor="middle" fill="${card.accent}" fill-opacity="0.9" font-family="Georgia, serif" font-size="118">${card.glyph}</text>
  <text x="250" y="390" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-family="ui-monospace, monospace" font-size="22" letter-spacing="10">${card.label}</text>
  <text x="250" y="430" text-anchor="middle" fill="rgba(255,255,255,0.28)" font-family="ui-monospace, monospace" font-size="11" letter-spacing="6">${card.tag}</text>
  <text x="250" y="610" text-anchor="middle" fill="rgba(255,255,255,0.18)" font-family="ui-monospace, monospace" font-size="10" letter-spacing="5">KILLSCOMFORT</text>
</svg>`;
}

mkdirSync(outDir, { recursive: true });
for (const card of cards) {
  writeFileSync(join(outDir, `${card.slug}.svg`), svg(card));
}
console.log(`Wrote ${cards.length} card SVGs to ${outDir}`);
