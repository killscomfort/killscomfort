"use client";

import { useRouter } from "next/navigation";
import KillsComfortRide from "./KillsComfortRide";
import { RideGameShell } from "./RideGameShell";

export function WarehouseGameClient() {
  const router = useRouter();

  return (
    <RideGameShell>
      <KillsComfortRide onSkip={() => router.push("/")} onArcade={() => router.push("/ride")} />
    </RideGameShell>
  );
}
