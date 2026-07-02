"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isValidStreetRunProfile,
  readLastSubmittedScore,
  readLocalHighScore,
  readLocalHighScoreEmail,
  readLocalHighScoreUsername,
  saveStreetRunScore,
  writeLastSubmittedScore,
  writeLocalHighScore,
  writeLocalHighScoreEmail,
  writeLocalHighScoreUsername,
  type StreetRunLeaderboardEntry,
} from "@/lib/street-run";
import styles from "./street-run.module.css";

type Props = {
  score: number;
  character: "boy" | "girl";
  onRetry: () => void;
};

export function StreetGameOver({ score, character, onRetry }: Props) {
  const router = useRouter();
  const [best, setBest] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [leaderboard, setLeaderboard] = useState<StreetRunLeaderboardEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const saveAttemptedRef = useRef(false);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const lb = await fetch("/api/street-run/scores?limit=10").then((r) => r.json());
      setLeaderboard(lb.scores ?? []);
    } catch {
      setLeaderboard([]);
    }
  }, []);

  const persistHighScore = useCallback(
    async (u: string, e: string, runScore: number) => {
      if (saveAttemptedRef.current) return;
      if (!isValidStreetRunProfile(u, e)) return;
      if (runScore <= readLastSubmittedScore()) {
        setMsg("Your saved high score is still higher — ride again to beat it.");
        return;
      }

      saveAttemptedRef.current = true;
      setSaving(true);
      setErr("");

      try {
        const result = await saveStreetRunScore({
          username: u.trim(),
          email: e.trim(),
          score: runScore,
          character,
        });

        if (!result.ok) {
          saveAttemptedRef.current = false;
          setErr(result.errors?.username ?? result.errors?.email ?? result.message ?? "Could not save score");
          return;
        }

        const trimmedName = u.trim();
        writeLocalHighScoreUsername(trimmedName);
        writeLocalHighScoreEmail(e.trim());
        writeLastSubmittedScore(runScore);
        setMsg(
          result.stored
            ? `High score saved as ${trimmedName}!`
            : "Score recorded locally.",
        );
        await refreshLeaderboard();
      } catch {
        saveAttemptedRef.current = false;
        setErr("Network error — try again.");
      } finally {
        setSaving(false);
      }
    },
    [character, refreshLeaderboard],
  );

  useEffect(() => {
    saveAttemptedRef.current = false;
    setMsg("");
    setErr("");

    const local = readLocalHighScore();
    const nextBest = Math.max(local, score);
    if (score > local) writeLocalHighScore(score);
    setBest(nextBest);

    const storedUsername = readLocalHighScoreUsername();
    const storedEmail = readLocalHighScoreEmail();
    setUsername(storedUsername);
    setEmail(storedEmail);

    refreshLeaderboard();

    if (isValidStreetRunProfile(storedUsername, storedEmail)) {
      void persistHighScore(storedUsername, storedEmail, score);
    }
  }, [score, persistHighScore, refreshLeaderboard]);

  useEffect(() => {
    if (!isValidStreetRunProfile(username, email)) return;
    if (score <= readLastSubmittedScore()) return;

    const storedUsername = readLocalHighScoreUsername();
    const storedEmail = readLocalHighScoreEmail();
    const profileReady =
      !isValidStreetRunProfile(storedUsername, storedEmail) ||
      username.trim() !== storedUsername ||
      email.trim() !== storedEmail;

    if (!profileReady) return;

    const timer = window.setTimeout(() => {
      void persistHighScore(username, email, score);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [username, email, score, persistHighScore]);

  const hasProfile = isValidStreetRunProfile(username, email);
  const alreadySaved = score <= readLastSubmittedScore() && hasProfile;

  return (
    <div className={styles.gameOver}>
      <div className={styles.gameOverBox}>
        <h2>— wiped out —</h2>
        <div className={styles.scoreRow}>
          <div className={styles.scoreBlock}>
            <div className={styles.scoreLabel}>This run</div>
            <div className={styles.scoreValue}>{score}</div>
          </div>
          <div className={styles.scoreBlock}>
            <div className={styles.scoreLabel}>Your best</div>
            <div className={styles.scoreValue}>{best}</div>
          </div>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void persistHighScore(username, email, score);
          }}
        >
          <p className={styles.formHint}>
            {hasProfile
              ? "Your high scores save automatically when you beat your best."
              : "Enter your name and email once — we'll save new high scores for you."}
          </p>
          <label htmlFor="street-username">Username (shown on leaderboard)</label>
          <input
            id="street-username"
            type="text"
            autoComplete="nickname"
            placeholder="your name"
            value={username}
            onChange={(e) => {
              saveAttemptedRef.current = false;
              setUsername(e.target.value);
            }}
            maxLength={20}
            required
          />
          <label htmlFor="street-email">Email (private — not shown on board)</label>
          <input
            id="street-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              saveAttemptedRef.current = false;
              setEmail(e.target.value);
            }}
            required
          />
          {saving ? <p className={styles.formMsg}>Saving high score…</p> : null}
          {!saving && msg ? <p className={styles.formMsg}>{msg}</p> : null}
          {!saving && err ? <p className={styles.formErr}>{err}</p> : null}
          {!saving && alreadySaved && !msg ? (
            <p className={styles.formMsg}>Your best score is already on the board.</p>
          ) : null}
        </form>

        <div className={styles.actions}>
          {!hasProfile ? (
            <button
              type="button"
              className={styles.primary}
              disabled={saving || !isValidStreetRunProfile(username, email)}
              onClick={() => void persistHighScore(username, email, score)}
            >
              {saving ? "saving…" : "save profile & score"}
            </button>
          ) : null}
          <button type="button" className={hasProfile ? styles.primary : undefined} onClick={onRetry}>
            ride again
          </button>
          <button type="button" onClick={() => router.push("/ride")}>
            arcade
          </button>
        </div>

        {leaderboard.length > 0 && (
          <div className={styles.leaderboard}>
            <h3>Top runs</h3>
            {leaderboard.map((row, i) => (
              <div key={`${row.username}-${row.created_at}-${i}`} className={styles.lbRow}>
                <span>
                  {i + 1}. {row.username}
                </span>
                <span>{row.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
