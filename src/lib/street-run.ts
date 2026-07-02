import { z } from "zod";

export const streetRunUsernameSchema = z
  .string()
  .trim()
  .min(2, "Pick a name (2+ characters)")
  .max(20, "Keep it under 20 characters")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Letters, numbers, spaces, - and _ only");

export const streetRunScoreSchema = z.object({
  username: streetRunUsernameSchema,
  email: z.string().email("Enter a valid email"),
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
};

export const LOCAL_HIGHSCORE_KEY = "kc-street-highscore";
export const LOCAL_HIGHSCORE_EMAIL_KEY = "kc-street-highscore-email";
export const LOCAL_HIGHSCORE_USERNAME_KEY = "kc-street-highscore-username";
export const LOCAL_LAST_SUBMITTED_KEY = "kc-street-last-submitted";

export function isValidStreetRunProfile(username: string, email: string) {
  return (
    streetRunUsernameSchema.safeParse(username).success &&
    z.string().email().safeParse(email).success
  );
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${user.length > 2 ? "•••" : ""}@${domain}`;
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
  | { ok: true; stored: boolean }
  | { ok: false; errors?: Record<string, string>; message?: string };

export async function saveStreetRunScore(input: {
  username: string;
  email: string;
  score: number;
  character?: "boy" | "girl";
}): Promise<StreetRunSaveResult> {
  const res = await fetch("/api/street-run/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      errors: data.errors,
      message: data.message ?? "Could not save score",
    };
  }
  return { ok: true, stored: Boolean(data.stored) };
}
