"use client";

import { useRouter } from "next/navigation";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import { storeCharacter, unlockStreetRun } from "@/lib/ride-games";
import type { CharacterType } from "./comfortRoomPalette";
import ComfortRoom from "./ComfortRoom";
import { RideGameShell } from "./RideGameShell";

export function RoomGameClient() {
  const router = useRouter();
  const { startPortalTransit } = usePortalTransit();

  const leaveForStreet = (character: CharacterType) => {
    storeCharacter(character);
    unlockStreetRun();
    startPortalTransit("/ride/street");
  };

  return (
    <RideGameShell>
      <ComfortRoom onLeave={leaveForStreet} onSkip={() => router.push("/")} skipLabel="leave site" />
    </RideGameShell>
  );
}
