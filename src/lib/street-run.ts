import { z } from "zod";

export const streetRunScoreSchema = z.object({
  email: z.string().email("Enter a valid email"),
  score: z.number().int().min(0).max(9_999_999),
  character: z.enum(["boy", "girl"]).optional(),
});

export type StreetRunScoreInput = z.infer<typeof streetRunScoreSchema>;

export type StreetRunLeaderboardEntry = {
  email: string;
  score: number;
  character: string | null;
  created_at: string;
};

export type StreetRunScoreRow = StreetRunLeaderboardEntry & {
  id: string;
};

export const LOCAL_HIGHSCORE_KEY = "kc-street-highscore";
export const LOCAL_HIGHSCORE_EMAIL_KEY = "kc-street-highscore-email";

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
