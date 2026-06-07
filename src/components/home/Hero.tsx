"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BrandText } from "@/components/ui/BrandText";
import { LatestReleaseCallout } from "@/components/home/LatestReleaseCallout";
import { HERO_BG_SRC, LOGO_SRC, SITE } from "@/lib/constants";
import type { MusicRelease } from "@/lib/music";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type HeroProps = {
  latestRelease?: MusicRelease;
};

export function Hero({ latestRelease }: HeroProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 min-h-screen w-full overflow-hidden">
        <div
          className="hero-bg-ken-burns h-full min-h-screen w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${HERO_BG_SRC}")` }}
          role="img"
          aria-label={`${SITE.founder} performing live`}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-near-black/60 via-near-black/10 to-near-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-near-black/90 via-transparent to-near-black/40" />
      <div className="hero-vignette absolute inset-0 opacity-70" />
      <div className="hero-glow-pulse absolute inset-0 bg-gradient-to-r from-muted-gold/10 via-transparent to-burnt-sienna/10 mix-blend-soft-light" />
      <div className="grain-overlay absolute inset-0" />

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 pb-20 text-center sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Image
            src={LOGO_SRC}
            alt={SITE.name}
            width={720}
            height={160}
            className="mx-auto h-auto w-full max-w-2xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] sm:max-w-3xl lg:max-w-4xl"
            priority
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-xl text-2xl leading-relaxed text-bone/90 drop-shadow-lg sm:text-3xl"
        >
          <BrandText variant="inline">{SITE.tagline}</BrandText>
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex justify-center">
          <Button href="/music" size="lg">
            See My Work
          </Button>
        </motion.div>

        {latestRelease && (
          <motion.div variants={itemVariants}>
            <LatestReleaseCallout release={latestRelease} />
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-bone/40">
            Scroll
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-clay/60 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
