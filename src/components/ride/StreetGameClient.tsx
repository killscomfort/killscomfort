"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHARACTER_STORAGE_KEY } from "@/lib/ride-games";
import type { CharacterType } from "./comfortRoomPalette";
import { CharacterSelect } from "./CharacterSelect";
import RoomBikeRide from "./RoomBikeRide";
import { RideGameShell } from "./RideGameShell";
import styles from "./comfortRoom.module.css";

export function StreetGameClient() {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [finished, setFinished] = useState(false);

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
    setFinished(false);
    try {
      sessionStorage.setItem(CHARACTER_STORAGE_KEY, type);
    } catch {
      /* ignore */
    }
  };

  if (!character) {
    return (
      <RideGameShell>
        <div className={styles.wrap}>
          <CharacterSelect onPick={pick} onSkip={() => router.push("/ride")} skipLabel="back to arcade" />
        </div>
      </RideGameShell>
    );
  }

  return (
    <RideGameShell>
      <div className={styles.wrap}>
        <RoomBikeRide
          character={character}
          onComplete={() => setFinished(true)}
        />
        {finished && (
          <div className={`${styles.overlay} ${styles.overlayOn}`}>
            <div className={styles.overlayBox}>
              <h2>run complete</h2>
              <p>You cleared the street. Run it again or head back to the arcade.</p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setFinished(false)}>
                  run again
                </button>
                <button type="button" onClick={() => router.push("/ride")}>
                  arcade
                </button>
              </div>
            </div>
          </div>
        )}
        <button type="button" className={styles.skipLink} onClick={() => router.push("/ride")}>
          arcade
        </button>
      </div>
    </RideGameShell>
  );
}
