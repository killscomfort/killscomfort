"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isValidStreetRunProfile,
  isValidStreetRunUsername,
  readLastSubmittedScore,
  readLocalHighScore,
  readPlayerProfile,
  saveStreetRunScore,
  shareStreetRunScore,
  writeLastSubmittedScore,
  writeLocalHighScore,
  writePlayerProfile,
  type StreetRunLeaderboardEntry,
} from "@/lib/street-run";
import styles from "./street-run.module.css";

type Props = {
  score: number;
  character: "boy" | "girl";
  onRetry: () => void;
  onContinueToWarehouse: () => void;
};

export function StreetGameOver({ score, character, onRetry, onContinueToWarehouse }: Props) {
  const [best, setBest] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [leaderboard, setLeaderboard] = useState<StreetRunLeaderboardEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [shareMsg, setShareMsg] = useState("");
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
      if (!isValidStreetRunUsername(u)) return;
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
          email: e.trim() || undefined,
          score: runScore,
          character,
        });

        if (!result.ok) {
          saveAttemptedRef.current = false;
          setErr(result.errors?.username ?? result.errors?.email ?? result.message ?? "Could not save score");
          return;
        }

        const trimmedName = u.trim();
        writePlayerProfile(trimmedName, e.trim());
        writeLastSubmittedScore(runScore);
        setMsg(
          result.stored
            ? `High score saved as ${trimmedName}!`
            : result.reason === "not_personal_best"
              ? "You already have a higher score on the board."
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
    setShareMsg("");

    const local = readLocalHighScore();
    const nextBest = Math.max(local, score);
    if (score > local) writeLocalHighScore(score);
    setBest(nextBest);

    const profile = readPlayerProfile();
    setUsername(profile.username);
    setEmail(profile.email);

    refreshLeaderboard();

    if (isValidStreetRunUsername(profile.username)) {
      void persistHighScore(profile.username, profile.email, score);
    }
  }, [score, persistHighScore, refreshLeaderboard]);

  const shareScore = async () => {
    try {
      await shareStreetRunScore(score, username.trim() || "Rider");
      setShareMsg("Score copied — share it anywhere!");
    } catch {
      setShareMsg("Could not share right now.");
    }
  };

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

        {username ? (
          <p className={styles.formHint}>Playing as <strong>{username}</strong></p>
        ) : null}

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void persistHighScore(username, email, score);
          }}
        >
          <label htmlFor="street-username">Update username</label>
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
          <label htmlFor="street-email">Email (optional — private)</label>
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
          />
          {saving ? <p className={styles.formMsg}>Saving high score…</p> : null}
          {!saving && msg ? <p className={styles.formMsg}>{msg}</p> : null}
          {!saving && err ? <p className={styles.formErr}>{err}</p> : null}
        </form>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onContinueToWarehouse}>
            ride to warehouse →
          </button>
          <button type="button" onClick={onRetry}>
            ride again
          </button>
          <button type="button" onClick={shareScore}>
            share score
          </button>
        </div>
        {shareMsg ? <p className={styles.formMsg}>{shareMsg}</p> : null}

        {leaderboard.length > 0 && (
          <div className={styles.leaderboard}>
            <h3>Top riders</h3>
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
