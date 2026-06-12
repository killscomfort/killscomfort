"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { BrandText } from "@/components/ui/BrandText";
import { SparkleWrap } from "@/components/ui/SparkleWrap";
import { HeroMusic } from "@/components/home/HeroMusic";
import { HOME_HERO_IMAGE } from "@/lib/about";
import { LOGO_SRC, SITE } from "@/lib/constants";

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

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 w-full overflow-hidden">
        <video
          className="h-full w-full object-cover object-center grayscale contrast-125 brightness-75 saturate-0"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={HOME_HERO_IMAGE}
          aria-hidden="true"
        >
          <source src="/video/dj-footy-ai.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-near-black/60 via-near-black/10 to-near-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-near-black/90 via-transparent to-near-black/40" />
      <div className="hero-vignette absolute inset-0 opacity-70" />
      <div className="hero-glow-pulse absolute inset-0 bg-gradient-to-r from-muted-gold/10 via-transparent to-burnt-sienna/10 mix-blend-soft-light" />
      <div className="grain-overlay absolute inset-0" />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-8 text-center sm:px-6 sm:pb-36 lg:px-8 lg:pb-40"
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
            className="mx-auto h-auto w-full max-w-[400px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] sm:max-w-[480px] lg:max-w-2xl"
            priority
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-4 max-w-xl text-xl leading-relaxed text-bone/90 drop-shadow-lg sm:text-2xl"
        >
          <BrandText variant="inline">{SITE.tagline}</BrandText>
        </motion.p>

        <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center">
          <motion.div
            className="relative"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 rounded bg-muted-gold/25 blur-xl"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.06, 0.92] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <SparkleWrap>
              <Button href="#book" size="lg" className="relative shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                Check Availability
              </Button>
            </SparkleWrap>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 w-full">
          <HeroMusic />
        </motion.div>

      </motion.div>
    </section>
  );
}
