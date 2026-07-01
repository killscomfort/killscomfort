"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  maskEmail,
  readLocalHighScore,
  readLocalHighScoreEmail,
  writeLocalHighScore,
  writeLocalHighScoreEmail,
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
  const [email, setEmail] = useState("");
  const [leaderboard, setLeaderboard] = useState<StreetRunLeaderboardEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const local = readLocalHighScore();
    const nextBest = Math.max(local, score);
    if (score > local) writeLocalHighScore(score);
    setBest(nextBest);
    setEmail(readLocalHighScoreEmail());
  }, [score]);

  useEffect(() => {
    fetch("/api/street-run/scores?limit=10")
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.scores ?? []))
      .catch(() => setLeaderboard([]));
  }, [score]);

  const submitScore = useCallback(async () => {
    setErr("");
    setMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/street-run/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, score, character }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.errors?.email ?? data.message ?? "Could not save score");
        return;
      }
      writeLocalHighScoreEmail(email);
      setMsg(data.stored ? "Score saved to leaderboard." : "Score recorded locally.");
      const lb = await fetch("/api/street-run/scores?limit=10").then((r) => r.json());
      setLeaderboard(lb.scores ?? []);
    } catch {
      setErr("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  }, [character, email, score]);

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
            submitScore();
          }}
        >
          <label htmlFor="street-email">Save to leaderboard</label>
          <input
            id="street-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {msg ? <p className={styles.formMsg}>{msg}</p> : null}
          {err ? <p className={styles.formErr}>{err}</p> : null}
        </form>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} disabled={submitting} onClick={submitScore}>
            {submitting ? "saving…" : "submit score"}
          </button>
          <button type="button" onClick={onRetry}>
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
              <div key={`${row.email}-${row.created_at}-${i}`} className={styles.lbRow}>
                <span>
                  {i + 1}. {maskEmail(row.email)}
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
