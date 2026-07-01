"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHARACTER_STORAGE_KEY } from "@/lib/ride-games";
import type { CharacterType } from "./comfortRoomPalette";
import { CharacterSelect } from "./CharacterSelect";
import StreetRunGame from "./StreetRunGame";
import { StreetGameOver } from "./StreetGameOver";
import { RideGameShell } from "./RideGameShell";
import styles from "./street-run.module.css";
import roomStyles from "./comfortRoom.module.css";

export function StreetGameClient() {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHARACTER_STORAGE_KEY) as CharacterType | null;
      if (saved === "boy" || saved === "girl") {
        setCharacter(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const pick = (type: CharacterType) => {
    setCharacter(type);
    setLastScore(null);
    setGameKey((k) => k + 1);
    try {
      sessionStorage.setItem(CHARACTER_STORAGE_KEY, type);
    } catch {
      /* ignore */
    }
  };

  if (!character) {
    return (
      <RideGameShell>
        <div className={roomStyles.wrap}>
          <CharacterSelect onPick={pick} onSkip={() => router.push("/ride")} skipLabel="back to arcade" />
        </div>
      </RideGameShell>
    );
  }

  return (
    <RideGameShell>
      <div style={{ position: "absolute", inset: 0 }}>
        <button type="button" className={styles.arcadeBtn} onClick={() => router.push("/ride")}>
          arcade
        </button>
        <StreetRunGame
          key={gameKey}
          character={character}
          onGameOver={(score) => setLastScore(score)}
        />
        {lastScore !== null && (
          <StreetGameOver
            score={lastScore}
            character={character}
            onRetry={() => {
              setLastScore(null);
              setGameKey((k) => k + 1);
            }}
          />
        )}
      </div>
    </RideGameShell>
  );
}
