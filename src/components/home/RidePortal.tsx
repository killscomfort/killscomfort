"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function RidePortal() {
  return (
    <section
      id="ride-portal"
      className="ride-portal section-padding relative overflow-hidden border-y border-white/[0.06] bg-near-black"
      aria-labelledby="ride-portal-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 38px, rgba(0,0,0,0.35) 38px 40px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,80vw)] w-[min(520px,80vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone/45">
          570 NW 22ND ST · <span className="text-bone/80">Bay 07</span>
        </p>

        <motion.div
          className="ride-portal-frame mx-auto mt-8 max-w-md"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/ride" className="ride-portal-door group block">
            <div className="ride-portal-door-inner">
              <span className="ride-portal-glyph" aria-hidden>
                ✦
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50">
                Warehouse access
              </span>
              <span
                id="ride-portal-heading"
                className="mt-3 font-display text-3xl uppercase leading-none text-bone sm:text-4xl"
              >
                Enter the
                <br />
                ride
              </span>
              <span className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/55 transition-colors group-hover:text-bone">
                Roll in →
              </span>
            </div>
          </Link>
        </motion.div>

        <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-bone/55 sm:text-base">
          KillsComfort is a ride, not a homepage. Cut through the alley, build a beat in the
          warehouse, dig the crates, and find what&apos;s stashed inside.
        </p>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
          {"> "}geo.lock: <span className="text-bone/55">MIAMI_AREA</span>
          {" // "}mode: <span className="text-bone/55">INTERACTIVE</span>
          {" // "}sound: <span className="text-bone/55">ON</span>
        </p>
      </div>
    </section>
  );
}
