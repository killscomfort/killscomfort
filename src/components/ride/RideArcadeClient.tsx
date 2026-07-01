"use client";

import { MiniGameCardGrid } from "@/components/MiniGameCardGrid";
import { ARCADE_CARDS } from "@/data/minigameCards";
import { RideGameShell } from "./RideGameShell";

export function RideArcadeClient() {
  return (
    <RideGameShell>
      <MiniGameCardGrid
        id="ride-arcade"
        cards={ARCADE_CARDS}
        embedded
        launchWithPortal
        backHref="/"
        backLabel="← site"
        eyebrow="THREE BREACHES · PICK A CARD"
        title="Enter a world"
        lede="Each card is its own game — room, street, and warehouse are separate entrances."
      />
    </RideGameShell>
  );
}
