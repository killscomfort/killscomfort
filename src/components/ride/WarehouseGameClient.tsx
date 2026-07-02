"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  canAccessWarehouseHub,
  canEnterWarehouseRide,
} from "@/lib/ride-games";
import KillsComfortRide from "./KillsComfortRide";
import { RideGameShell } from "./RideGameShell";

type HubPanel = "beat" | "dig" | "mixes" | "wall" | null;

const PANEL_ALIASES: Record<string, HubPanel> = {
  beat: "beat",
  cassette: "beat",
  dig: "dig",
  crates: "dig",
  mixes: "mixes",
  wall: "wall",
};

function WarehouseGameInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoride = searchParams.get("autoride") === "1";
  const panelParam = searchParams.get("panel") ?? searchParams.get("game");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canEnterWarehouseRide()) {
      router.replace("/ride/room");
      return;
    }

    const panel = panelParam ? PANEL_ALIASES[panelParam] : null;
    if (panel && !canAccessWarehouseHub()) {
      router.replace("/ride/warehouse?autoride=1");
      return;
    }

    setReady(true);
  }, [panelParam, router]);

  if (!ready) {
    return null;
  }

  const initialPanel = panelParam ? PANEL_ALIASES[panelParam] ?? null : null;
  const initialScene = canAccessWarehouseHub() ? "hub" : autoride ? "ride" : "enter";

  return (
    <RideGameShell>
      <KillsComfortRide
        initialScene={initialScene}
        initialPanel={initialPanel}
        onSkip={() => router.push("/")}
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
