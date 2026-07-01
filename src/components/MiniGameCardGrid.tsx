"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import { cn } from "@/lib/utils";
import { MINIGAME_CARDS, type MinigameCard as MinigameCardData } from "@/data/minigameCards";
import { MiniGameCard } from "./MiniGameCard";

type Props = {
  cards?: MinigameCardData[];
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  backHref?: string | false;
  backLabel?: string;
  className?: string;
  embedded?: boolean;
  launchWithPortal?: boolean;
};

export function MiniGameCardGrid({
  cards = MINIGAME_CARDS,
  id = "warehouse-cards",
  eyebrow = "THE WAREHOUSE · PICK A CARD",
  title = "Choose your entrance",
  lede = "Each card drops you straight into a minigame. Roll in from the alley or breach a door already open inside.",
  backHref = "/ride",
  backLabel = "← Arcade",
  className,
  embedded = false,
  launchWithPortal = false,
}: Props) {
  const router = useRouter();
  const { startPortalTransit, isActive } = usePortalTransit();
  const [launching, setLaunching] = useState<string | null>(null);

  useEffect(() => {
    if (!launchWithPortal) return;
    cards.forEach((card) => router.prefetch(card.href.split("?")[0]));
  }, [cards, router, launchWithPortal]);

  const handleLaunch = useCallback(
    (card: MinigameCardData) => {
      if (launching || isActive) return;
      setLaunching(card.id);
      startPortalTransit(card.href);
    },
    [isActive, launching, startPortalTransit],
  );

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-x-hidden text-white",
        embedded
          ? "border-y border-white/10 bg-near-black py-16 sm:py-20"
          : "min-h-[100dvh] overflow-y-auto bg-black py-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        "px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
        className,
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: embedded
            ? "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04) 0%, transparent 42%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 38%)"
            : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 md:gap-10">
        {backHref ? (
          <Link
            href={backHref}
            className="self-start font-mono text-[11px] tracking-[0.14em] text-zinc-500 uppercase transition-colors hover:text-white"
          >
            {backLabel}
          </Link>
        ) : null}

        <header className={cn("max-w-2xl space-y-3", embedded && "mx-auto text-center")}>
          <p className="font-mono text-[11px] tracking-[0.18em] text-zinc-500 uppercase">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="font-[family-name:var(--font-pt-serif)] text-3xl leading-[1.05] tracking-[0.01em] text-white sm:text-4xl md:text-[2.65rem]"
          >
            {title}
          </h2>
          <p className={cn("max-w-xl text-base leading-relaxed text-zinc-400", embedded && "mx-auto")}>{lede}</p>
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {cards.map((card, index) => (
            <li key={card.id} className="min-h-[280px] sm:min-h-[320px]">
              <MiniGameCard
                card={card}
                priority={index < 2}
                disabled={!!launching || isActive}
                launching={launching === card.id}
                onLaunch={launchWithPortal ? () => handleLaunch(card) : undefined}
              />
            </li>
          ))}
        </ul>

        <p className={cn("font-mono text-[11px] tracking-[0.12em] text-zinc-600", embedded && "text-center")}>
          {"> "}deck: <span className="text-zinc-400">{cards.length} ENTRANCES</span>
          {" // "}mode: <span className="text-zinc-400">COLLECTIBLE</span>
        </p>
      </div>
    </section>
  );
}
