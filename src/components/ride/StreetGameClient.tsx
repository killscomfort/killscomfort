"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import {
  canPlayStreetRun,
  readStoredCharacter,
  unlockWarehouseRide,
} from "@/lib/ride-games";
import type { CharacterType } from "./comfortRoomPalette";
import StreetRunGame from "./StreetRunGame";
import { StreetGameOver } from "./StreetGameOver";
import { RideGameShell } from "./RideGameShell";

export function StreetGameClient() {
  const router = useRouter();
  const { startPortalTransit } = usePortalTransit();
  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canPlayStreetRun()) {
      router.replace("/ride/room");
      return;
    }
    const saved = readStoredCharacter();
    if (!saved) {
      router.replace("/ride/room");
      return;
    }
    setCharacter(saved);
    setReady(true);
  }, [router]);

  const continueToWarehouse = () => {
    unlockWarehouseRide();
    startPortalTransit("/ride/warehouse?autoride=1");
  };

  if (!ready || !character) {
    return null;
  }

  return (
    <RideGameShell>
      <div style={{ position: "absolute", inset: 0 }}>
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
            onContinueToWarehouse={continueToWarehouse}
          />
        )}
      </div>
    </RideGameShell>
  );
}
