"use client";

import { useRouter } from "next/navigation";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import { CHARACTER_STORAGE_KEY } from "@/lib/ride-games";
import type { CharacterType } from "./comfortRoomPalette";
import ComfortRoom from "./ComfortRoom";
import { RideGameShell } from "./RideGameShell";

export function RoomGameClient() {
  const router = useRouter();
  const { startPortalTransit } = usePortalTransit();

  const goStreet = (character: CharacterType) => {
    try {
      sessionStorage.setItem(CHARACTER_STORAGE_KEY, character);
    } catch {
      /* ignore */
    }
    startPortalTransit("/ride/street");
  };

  return (
    <RideGameShell>
      <ComfortRoom
        onSkip={() => router.push("/ride")}
        skipLabel="back to arcade"
        onDoorExit={goStreet}
      />
    </RideGameShell>
  );
}
