import { z } from "zod";

const PROFANITY = [
  "ass",
  "asshole",
  "bastard",
  "bitch",
  "crap",
  "damn",
  "dick",
  "fuck",
  "fuk",
  "hell",
  "piss",
  "shit",
  "slut",
  "whore",
];

export function containsProfanity(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return PROFANITY.some((word) => normalized.includes(word));
}

export const streetRunUsernameSchema = z
  .string()
  .trim()
  .min(2, "Pick a name (2+ characters)")
  .max(20, "Keep it under 20 characters")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Letters, numbers, spaces, - and _ only")
  .refine((value) => !containsProfanity(value), "Please pick a different name");

export const streetRunEmailSchema = z
  .string()
  .trim()
  .refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email");

export const streetRunScoreSchema = z.object({
  username: streetRunUsernameSchema,
  email: streetRunEmailSchema,
  score: z.number().int().min(0).max(9_999_999),
  character: z.enum(["boy", "girl"]).optional(),
});

export type StreetRunScoreInput = z.infer<typeof streetRunScoreSchema>;

export type StreetRunLeaderboardEntry = {
  username: string;
  score: number;
  character: string | null;
  created_at: string;
};

export type StreetRunScoreRow = StreetRunLeaderboardEntry & {
  id: string;
  email: string | null;
  username_key: string;
};

export const LOCAL_HIGHSCORE_KEY = "kc-street-highscore";
export const LOCAL_HIGHSCORE_EMAIL_KEY = "kc-street-highscore-email";
export const LOCAL_HIGHSCORE_USERNAME_KEY = "kc-street-highscore-username";
export const LOCAL_LAST_SUBMITTED_KEY = "kc-street-last-submitted";
export const LOCAL_STREET_TUTORIAL_KEY = "kc-street-tutorial-seen";
export const LOCAL_STREET_MUTED_KEY = "kc-street-muted";

export function usernameKey(username: string) {
  return username.trim().toLowerCase();
}

export function isValidStreetRunUsername(username: string) {
  return streetRunUsernameSchema.safeParse(username).success;
}

export function isValidStreetRunProfile(username: string, email = "") {
  if (!isValidStreetRunUsername(username)) return false;
  if (!email.trim()) return true;
  return z.string().email().safeParse(email.trim()).success;
}

export function readPlayerProfile() {
  return {
    username: readLocalHighScoreUsername(),
    email: readLocalHighScoreEmail(),
  };
}

export function writePlayerProfile(username: string, email = "") {
  writeLocalHighScoreUsername(username.trim());
  writeLocalHighScoreEmail(email.trim());
}

export function readStreetMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCAL_STREET_MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeStreetMuted(muted: boolean) {
  try {
    localStorage.setItem(LOCAL_STREET_MUTED_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function hasSeenStreetTutorial(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(LOCAL_STREET_TUTORIAL_KEY) === "1";
  } catch {
    return true;
  }
}

export function markStreetTutorialSeen() {
  try {
    localStorage.setItem(LOCAL_STREET_TUTORIAL_KEY, "1");
  } catch {
    /* ignore */
  }
}

export async function shareStreetRunScore(score: number, username: string) {
  const text = `${username} scored ${score} on Street Run at KillsComfort!`;
  const url = typeof window !== "undefined" ? window.location.href : "https://www.killscomfort.com/ride/street";

  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: "Street Run", text, url });
    return;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${text}\n${url}`);
  }
}

export function readLocalHighScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LOCAL_HIGHSCORE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeLocalHighScore(score: number) {
  try {
    localStorage.setItem(LOCAL_HIGHSCORE_KEY, String(score));
  } catch {
    /* ignore */
  }
}

export function readLocalHighScoreEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LOCAL_HIGHSCORE_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLocalHighScoreEmail(email: string) {
  try {
    localStorage.setItem(LOCAL_HIGHSCORE_EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}

export function readLocalHighScoreUsername(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LOCAL_HIGHSCORE_USERNAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLocalHighScoreUsername(username: string) {
  try {
    localStorage.setItem(LOCAL_HIGHSCORE_USERNAME_KEY, username);
  } catch {
    /* ignore */
  }
}

export function readLastSubmittedScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LOCAL_LAST_SUBMITTED_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeLastSubmittedScore(score: number) {
  try {
    localStorage.setItem(LOCAL_LAST_SUBMITTED_KEY, String(score));
  } catch {
    /* ignore */
  }
}

export type StreetRunSaveResult =
  | { ok: true; stored: boolean; reason?: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

export async function saveStreetRunScore(input: {
  username: string;
  email?: string;
  score: number;
  character?: "boy" | "girl";
}): Promise<StreetRunSaveResult> {
  const res = await fetch("/api/street-run/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: input.username,
      email: input.email?.trim() || "",
      score: input.score,
      character: input.character,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      errors: data.errors,
      message: data.message ?? "Could not save score",
    };
  }
  return { ok: true, stored: Boolean(data.stored), reason: data.reason };
}
