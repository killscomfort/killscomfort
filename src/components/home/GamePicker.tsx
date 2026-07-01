"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PortalVortex } from "@/components/portal/PortalVortex";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import { RIDE_GAMES, type RideGame } from "@/lib/ride-games";
import styles from "./game-picker.module.css";

function accentClass(accent: RideGame["accent"]) {
  if (accent === "amber") return styles.cardAmber;
  if (accent === "chrome") return styles.cardChrome;
  return styles.cardGreen;
}

function labelClass(accent: RideGame["accent"]) {
  if (accent === "amber") return styles.portalLabelAmber;
  if (accent === "chrome") return styles.portalLabelChrome;
  return styles.portalLabel;
}

type Props = {
  id?: string;
  variant?: "home" | "ride";
  showBackLink?: boolean;
};

export function GamePicker({ id = "game-arcade", variant = "home", showBackLink = false }: Props) {
  const router = useRouter();
  const { startPortalTransit, isActive } = usePortalTransit();
  const [launching, setLaunching] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    RIDE_GAMES.forEach((game) => router.prefetch(game.href));
  }, [router]);

  const launch = useCallback(
    (game: RideGame) => {
      if (launching || isActive) return;
      setLaunching(game.id);
      startPortalTransit(game.href);
    },
    [isActive, launching, startPortalTransit],
  );

  const shellClass = variant === "ride" ? styles.rideShell : styles.arcadeSection;

  return (
    <section id={id} className={shellClass} aria-labelledby={`${id}-heading`}>
      {showBackLink && (
        <Link href="/" className={styles.backLink}>
          ← site
        </Link>
      )}

      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>Three breaches · pick your lane</p>
          <h2 id={`${id}-heading`} className={styles.title}>
            Enter a world
          </h2>
          <p className={styles.lede}>
            Each portal drops you into its own game. No chained paths — room, street, and warehouse are separate
            entrances.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {RIDE_GAMES.map((game, i) => (
            <motion.article
              key={game.id}
              className={`${styles.card} ${accentClass(game.accent)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.portalWrap}>
                <button
                  type="button"
                  className={styles.portalBtn}
                  disabled={!!launching || isActive}
                  onClick={() => launch(game)}
                  onMouseEnter={() => setHovered(game.id)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={`${game.portalLabel} — ${game.title}`}
                >
                  <PortalVortex intense={hovered === game.id || launching === game.id} />
                  <span className={labelClass(game.accent)}>
                    <span className={styles.glyph}>{game.glyph}</span>
                    {launching === game.id ? "Jumping..." : game.portalLabel}
                  </span>
                </button>
              </div>
              <div>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <p className={styles.gameTag}>{game.tagline}</p>
                <p className={styles.gameCopy}>{game.description}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <p className={styles.status}>
          {"> "}mode: <span className={styles.statusAccent}>ARCADE</span>
          {" // "}games: <span className={styles.statusAccent}>3 STANDALONE</span>
        </p>
      </div>
    </section>
  );
}

export function GameArcade() {
  return <GamePicker id="game-arcade" variant="home" />;
}
