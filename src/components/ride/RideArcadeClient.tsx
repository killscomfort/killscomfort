"use client";

import { GamePicker } from "@/components/home/GamePicker";
import { RideGameShell } from "./RideGameShell";

export function RideArcadeClient() {
  return (
    <RideGameShell>
      <GamePicker id="ride-arcade" variant="ride" showBackLink />
    </RideGameShell>
  );
}
