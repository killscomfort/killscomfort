// ============================================================
// THE CHROMATIC WHEEL — circle of fifths mapped to the color wheel.
// Adjacent keys (musically related) sit on adjacent hues (visually
// related). Complementary colors sit a tritone apart. That single
// mapping powers the whole course.
// ============================================================

export type KeyInfo = {
  name: string;        // e.g. "C"
  minor: string;       // relative minor, e.g. "Am"
  hue: number;         // 0–330, color wheel position
  sharpsFlats: string; // key signature label
  freq: number;        // tonic frequency (Hz), 4th octave-ish
};

// Circle of fifths order, starting at C (12 o'clock, hue 0 = red)
export const KEYS: KeyInfo[] = [
  { name: 'C',  minor: 'Am',  hue: 0,   sharpsFlats: '0',  freq: 261.63 },
  { name: 'G',  minor: 'Em',  hue: 30,  sharpsFlats: '1♯', freq: 392.0 },
  { name: 'D',  minor: 'Bm',  hue: 60,  sharpsFlats: '2♯', freq: 293.66 },
  { name: 'A',  minor: 'F♯m', hue: 90,  sharpsFlats: '3♯', freq: 440.0 },
  { name: 'E',  minor: 'C♯m', hue: 120, sharpsFlats: '4♯', freq: 329.63 },
  { name: 'B',  minor: 'G♯m', hue: 150, sharpsFlats: '5♯', freq: 493.88 },
  { name: 'F♯', minor: 'D♯m', hue: 180, sharpsFlats: '6♯', freq: 369.99 },
  { name: 'D♭', minor: 'B♭m', hue: 210, sharpsFlats: '5♭', freq: 277.18 },
  { name: 'A♭', minor: 'Fm',  hue: 240, sharpsFlats: '4♭', freq: 415.3 },
  { name: 'E♭', minor: 'Cm',  hue: 270, sharpsFlats: '3♭', freq: 311.13 },
  { name: 'B♭', minor: 'Gm',  hue: 300, sharpsFlats: '2♭', freq: 466.16 },
  { name: 'F',  minor: 'Dm',  hue: 330, sharpsFlats: '1♭', freq: 349.23 },
];

export const keyColor = (hue: number, sat = 82, light = 56) =>
  `hsl(${hue} ${sat}% ${light}%)`;

// Relative minor = same hue, darker shade
export const minorColor = (hue: number) => `hsl(${hue} 60% 34%)`;

export function keyByName(name: string): KeyInfo {
  return KEYS.find((k) => k.name === name) ?? KEYS[0];
}

// Neighbors on the wheel = closely related keys (analogous colors)
export function neighbors(name: string): [KeyInfo, KeyInfo] {
  const i = KEYS.findIndex((k) => k.name === name);
  return [KEYS[(i + 11) % 12], KEYS[(i + 1) % 12]];
}

// Tritone = directly across the wheel = complementary color
export function complement(name: string): KeyInfo {
  const i = KEYS.findIndex((k) => k.name === name);
  return KEYS[(i + 6) % 12];
}

// Major triad frequencies from a tonic (just intonation ratios)
export const triadFreqs = (tonic: number, quality: 'maj' | 'min' = 'maj') =>
  quality === 'maj'
    ? [tonic, tonic * 1.25, tonic * 1.5]
    : [tonic, tonic * 1.2, tonic * 1.5];

// ---------- XP / LEVELS ----------
// Level curve: each level costs progressively more.
export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const floorXp = 50 * (level - 1) ** 2;
  const nextXp = 50 * level ** 2;
  return { level, floorXp, nextXp, pct: Math.min(100, Math.round(((xp - floorXp) / (nextXp - floorXp)) * 100)) };
}

export const LEVEL_TITLES = [
  'LISTENER', 'TONE SEEKER', 'HUE APPRENTICE', 'SHADE WORKER',
  'HARMONIC', 'PALETTE BUILDER', 'COLOR MIXER', 'SPECTRUM ENGINEER',
  'CHROMATIC', 'FULL SPECTRUM',
];
export const levelTitle = (level: number) =>
  LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

// ---------- BADGES ----------
export type Badge = { id: string; name: string; desc: string; hue: number };
export const BADGES: Badge[] = [
  { id: 'first-light',   name: 'FIRST LIGHT',      desc: 'Complete your first lesson', hue: 0 },
  { id: 'sector-1',      name: 'THE WHEEL',        desc: 'Clear Sector 01',            hue: 30 },
  { id: 'sector-2',      name: 'SHADE SHIFTER',    desc: 'Clear Sector 02',            hue: 60 },
  { id: 'sector-3',      name: 'COLOR MIXER',      desc: 'Clear Sector 03',            hue: 120 },
  { id: 'sector-4',      name: 'PALETTE MASTER',   desc: 'Clear Sector 04',            hue: 180 },
  { id: 'sector-5',      name: 'PRODUCER',         desc: 'Clear Sector 05',            hue: 240 },
  { id: 'sector-6',      name: 'SPECTRUM ENGINEER',desc: 'Clear Sector 06',            hue: 300 },
  { id: 'perfect-fifth', name: 'PERFECT FIFTH',    desc: '5-day practice streak',      hue: 90 },
  { id: 'full-wheel',    name: 'FULL WHEEL',       desc: '12-day practice streak',     hue: 210 },
  { id: 'harmonic',      name: 'HARMONIC',         desc: 'Reach 1250 XP',              hue: 270 },
  { id: 'chromatic',     name: 'CHROMATIC',        desc: 'Complete every lesson',      hue: 330 },
];
export const badgeById = (id: string) => BADGES.find((b) => b.id === id);
