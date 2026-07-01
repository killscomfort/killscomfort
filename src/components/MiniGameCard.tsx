import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MinigameCardAccent, MinigameCardRarity, MinigameCard as MinigameCardData } from "@/data/minigameCards";

const ACCENT_GRADIENT: Record<MinigameCardAccent, string> = {
  chrome: "from-white/25 via-white/5 to-transparent",
  amber: "from-amber-200/30 via-amber-500/10 to-transparent",
  blood: "from-red-400/25 via-red-900/10 to-transparent",
  bone: "from-zinc-200/20 via-zinc-500/5 to-transparent",
};

const ACCENT_RING: Record<MinigameCardAccent, string> = {
  chrome: "ring-white/20 group-hover:ring-white/40",
  amber: "ring-amber-300/25 group-hover:ring-amber-200/45",
  blood: "ring-red-400/20 group-hover:ring-red-300/35",
  bone: "ring-zinc-300/20 group-hover:ring-zinc-200/35",
};

const RARITY_LABEL: Record<MinigameCardRarity, string> = {
  common: "COMMON",
  uncommon: "UNCOMMON",
  rare: "RARE",
  legendary: "LEGENDARY",
};

const RARITY_TONE: Record<MinigameCardRarity, string> = {
  common: "text-zinc-400 border-zinc-600/60 bg-zinc-950/80",
  uncommon: "text-amber-200/90 border-amber-500/35 bg-amber-950/50",
  rare: "text-white/90 border-white/25 bg-black/70",
  legendary: "text-white border-white/40 bg-black/80 shadow-[0_0_18px_rgba(255,255,255,0.12)]",
};

type Props = {
  card: MinigameCardData;
  className?: string;
  priority?: boolean;
};

export function MiniGameCard({ card, className, priority = false }: Props) {
  return (
    <Link
      href={card.href}
      className={cn(
        "group relative block h-full outline-none transition-transform duration-300 ease-out",
        "hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
        "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
      aria-label={`${card.title} — ${card.subtitle}`}
    >
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#0a0a0a]",
          "shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-shadow duration-300",
          "group-hover:shadow-[0_24px_52px_rgba(0,0,0,0.72)]",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[1.1rem] bg-gradient-to-br opacity-80",
            ACCENT_GRADIENT[card.accent],
          )}
          aria-hidden
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-[1px] rounded-[1.05rem] ring-1 ring-inset transition-[box-shadow,ring-color] duration-300",
            ACCENT_RING[card.accent],
          )}
          aria-hidden
        />

        <div className="relative aspect-[5/7] w-full overflow-hidden border-b border-white/8 bg-[#111]">
          <Image
            src={card.image}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 220px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" aria-hidden />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            {card.index ? (
              <span className="font-mono text-[10px] tracking-[0.18em] text-white/55">{card.index}</span>
            ) : null}
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.16em]",
                RARITY_TONE[card.rarity],
              )}
            >
              {RARITY_LABEL[card.rarity]}
            </span>
          </div>

          <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.2em] text-white/70">
            {card.tag}
          </span>
        </div>

        <div className="relative flex flex-1 flex-col gap-1.5 px-4 py-4">
          <h3 className="font-[family-name:var(--font-pt-serif)] text-lg leading-tight tracking-[0.01em] text-white">
            {card.title}
          </h3>
          <p className="text-sm leading-snug text-zinc-400">{card.subtitle}</p>
          <p className="mt-auto pt-2 font-mono text-[10px] tracking-[0.14em] text-white/45 uppercase">
            Tap to enter →
          </p>
        </div>
      </article>
    </Link>
  );
}
