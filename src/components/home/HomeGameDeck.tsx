"use client";

import { MiniGameCardGrid } from "@/components/MiniGameCardGrid";

export function HomeGameDeck() {
  return (
    <MiniGameCardGrid
      id="game-arcade"
      embedded
      launchWithPortal
      backHref={false}
      eyebrow="THE WAREHOUSE · PICK A CARD"
      title="Enter a world"
      lede="Each card breaches the warehouse — roll in from the alley or drop straight into a minigame already lit inside."
    />
  );
}
