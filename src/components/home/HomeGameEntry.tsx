"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import { MiniGameCard } from "@/components/MiniGameCard";
import { HOME_ENTRY_CARD } from "@/data/minigameCards";
import { cn } from "@/lib/utils";

export function HomeGameEntry() {
  const router = useRouter();
  const { startPortalTransit, isActive } = usePortalTransit();
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    router.prefetch("/ride");
  }, [router]);

  const handleLaunch = useCallback(() => {
    if (launching || isActive) return;
    setLaunching(true);
    startPortalTransit(HOME_ENTRY_CARD.href);
  }, [isActive, launching, startPortalTransit]);

  return (
    <section
      id="game-arcade"
      className="border-y border-white/10 bg-near-black px-4 py-14 sm:py-16"
      aria-labelledby="game-arcade-heading"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <p className="font-mono text-[11px] tracking-[0.18em] text-zinc-500 uppercase">One card · three worlds</p>
          <h2
            id="game-arcade-heading"
            className="font-[family-name:var(--font-pt-serif)] text-2xl tracking-[0.01em] text-white sm:text-3xl"
          >
            Tap in
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
            Pull the arcade card to breach room, street, and warehouse — all behind one door.
          </p>
        </div>

        <div className={cn("w-full max-w-[220px] sm:max-w-[240px]", launching && "pointer-events-none")}>
          <MiniGameCard
            card={HOME_ENTRY_CARD}
            priority
            disabled={launching || isActive}
            launching={launching}
            onLaunch={handleLaunch}
          />
        </div>

        <p className="font-mono text-[11px] tracking-[0.12em] text-zinc-600">
          {"> "}entry: <span className="text-zinc-400">ARCADE</span>
          {" // "}games: <span className="text-zinc-400">3 INSIDE</span>
        </p>
      </div>
    </section>
  );
}
