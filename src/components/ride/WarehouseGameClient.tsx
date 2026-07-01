"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MiniGameCardGrid } from "@/components/MiniGameCardGrid";
import { getMinigameLaunch } from "@/data/minigameCards";
import KillsComfortRide from "./KillsComfortRide";
import { RideGameShell } from "./RideGameShell";

function WarehouseGameInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const game = searchParams.get("game");
  const launch = game ? getMinigameLaunch(game) : undefined;

  useEffect(() => {
    if (game && !launch) {
      router.replace("/ride/warehouse");
    }
  }, [game, launch, router]);

  if (!game) {
    return (
      <RideGameShell>
        <MiniGameCardGrid />
      </RideGameShell>
    );
  }

  if (!launch) {
    return null;
  }

  return (
    <RideGameShell>
      <KillsComfortRide
        initialScene={launch.initialScene}
        initialPanel={launch.initialPanel}
        onSkip={() => router.push("/")}
        onArcade={() => router.push("/ride")}
        onLobby={() => router.push("/ride/warehouse")}
      />
    </RideGameShell>
  );
}

export function WarehouseGameClient() {
  return (
    <Suspense fallback={null}>
      <WarehouseGameInner />
    </Suspense>
  );
}
