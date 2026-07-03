import { z } from "zod";

const recordSchema = z.object({
  t: z.string().min(1).max(80),
  s: z.string().max(40),
  gem: z.boolean(),
});

const wallPostSchema = z.object({
  by: z.string().min(1).max(40),
  p: z.string().min(1).max(200),
});

const mixSchema = z.object({
  id: z.string().min(1).max(40),
  t: z.string().min(1).max(80),
  s: z.string().max(40),
  src: z.string().max(80),
  motif: z.array(z.number().int()).min(1).max(24),
});

export const rideGameConfigSchema = z.object({
  enter: z.object({
    mark: z.string().min(1).max(80),
    title: z.string().min(1).max(120),
    lede: z.string().min(1).max(500),
    cta: z.string().min(1).max(40),
  }),
  hub: z.object({
    eyebrow: z.string().min(1).max(120),
    title: z.string().min(1).max(120),
    lede: z.string().min(1).max(500),
  }),
  exit: z.object({
    eyebrow: z.string().min(1).max(80),
    title: z.string().min(1).max(120),
    lede: z.string().min(1).max(500),
  }),
  merch: z.object({
    title: z.string().min(1).max(120),
    lede: z.string().min(1).max(500),
    cta: z.string().min(1).max(40),
  }),
  links: z.object({
    book: z.string().min(1),
    music: z.string().min(1),
    merch: z.string().min(1),
    instagram: z.string().min(1),
  }),
  records: z.array(recordSchema).min(1).max(12),
  wall: z.array(wallPostSchema).max(20),
  mixes: z.array(mixSchema).min(1).max(8),
});

export type RideGameConfig = z.infer<typeof rideGameConfigSchema>;

export const DEFAULT_RIDE_GAME_CONFIG: RideGameConfig = {
  enter: {
    mark: "TOEJAM808 · MIAMI",
    title: "Motion|Is Faith",
    lede:
      "KillsComfort is a ride, not a homepage. Cut through the alley, roll into the warehouse, build a beat, dig the crates, and find what's stashed inside.",
    cta: "Ride your bike →",
  },
  hub: {
    eyebrow: "570 NW 22ND ST · THE WAREHOUSE",
    title: "You rolled|inside.",
    lede: "Doors are open. Touch anything lit. The warehouse keeps what you find.",
  },
  exit: {
    eyebrow: "END OF THE RIDE",
    title: "Stay|uncomfortable.",
    lede:
      "That's KillsComfort: keep moving, keep digging, keep showing up. Here's where the rest of it lives.",
  },
  merch: {
    title: "Motion Is Faith|Heavyweight Hoodie",
    lede: "Blacked-out print, oversized fit. Only shows up if you went looking. Limited run.",
    cta: "Claim it →",
  },
  links: {
    book: "/book",
    music: "/music",
    merch: "/merch",
    instagram: "https://instagram.com/killscomfort",
  },
  records: [
    { t: "SUPERVISOR", s: "KC · 2024", gem: false },
    { t: "OPERATOR", s: "KC · 2024", gem: false },
    { t: "MOTION IS FAITH", s: "KC · ANTHEM", gem: true },
    { t: "GOOD OL RUB", s: "KC", gem: false },
    { t: "HOMOLOGATION", s: "KC", gem: false },
  ],
  wall: [
    { by: "KILLSCOMFORT", p: "Comfort is where momentum goes to die. Ride anyway." },
    { by: "@ANDREA_M", p: "First time DJing sober. Terrifying. Did it." },
    { by: "@LOTELEVEN", p: "Quit the job that paid more. Building the thing that pays in meaning." },
    { by: "@J.RIVERA", p: "Showed up to the picnic not knowing a soul. Left with five." },
  ],
  mixes: [
    {
      id: "rooftop",
      t: "Dat Thang (Live Edit)",
      s: "HOUSE · 124",
      src: "your beat",
      motif: [0, 4, 7, 12, 7, 4],
    },
    {
      id: "crate",
      t: "Motion Is Faith (Dub)",
      s: "TECHNO · 128",
      src: "the crate gem",
      motif: [0, 3, 7, 10, 7, 3],
    },
  ],
};

export function parseRideGameConfig(value: unknown): RideGameConfig {
  const parsed = rideGameConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_RIDE_GAME_CONFIG;
}
