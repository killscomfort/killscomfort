"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function PortalVortex({
  className = "",
  intense = false,
}: {
  className?: string;
  intense?: boolean;
}) {
  return (
    <div
      className={`portal-vortex ${intense ? "portal-vortex--intense" : ""} ${className}`.trim()}
      aria-hidden
    >
      <div className="portal-vortex__glow" />
      <div className="portal-vortex__ring portal-vortex__ring--a" />
      <div className="portal-vortex__ring portal-vortex__ring--b" />
      <div className="portal-vortex__ring portal-vortex__ring--c" />
      <div className="portal-vortex__swirl" />
      <div className="portal-vortex__core" />
      <div className="portal-vortex__sparks" />
    </div>
  );
}

export function RidePortal() {
  const router = useRouter();
  const [engulfing, setEngulfing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const enterPortal = useCallback(() => {
    if (engulfing) return;
    setEngulfing(true);
    window.setTimeout(() => router.push("/ride"), 1150);
  }, [engulfing, router]);

  return (
    <>
      <section
        id="ride-portal"
        className={`ride-portal section-padding relative overflow-hidden border-y border-white/[0.06] bg-near-black ${
          engulfing ? "ride-portal--engulfing" : ""
        }`}
        aria-labelledby="ride-portal-heading"
      >
        <div className="portal-void-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#5cff8a]/70">
              Dimensional breach detected
            </p>

            <h2
              id="ride-portal-heading"
              className="mt-4 font-display text-3xl uppercase leading-none text-bone sm:text-4xl"
            >
              Enter the ride
            </h2>
          </motion.div>

          <motion.div
            className="portal-trigger-wrap mx-auto mt-10"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="portal-trigger group"
              onClick={enterPortal}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              disabled={engulfing}
              aria-label="Open portal and enter the ride"
            >
              <PortalVortex intense={hovered || engulfing} />
              <span className="portal-trigger__label">
                <span className="portal-trigger__glyph">◎</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                  {engulfing ? "Jumping..." : "Fire portal"}
                </span>
              </span>
            </button>
          </motion.div>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-bone/55 sm:text-base">
            KillsComfort is a ride, not a homepage. Step through the cyclone — build a beat, dig the
            crates, find what&apos;s stashed inside.
          </p>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
            {"> "}mode: <span className="text-[#5cff8a]/80">INTERACTIVE</span>
            {" // "}input: <span className="text-bone/55">CLICK PORTAL</span>
          </p>
        </div>
      </section>

      <div
        className={`portal-takeover ${engulfing ? "portal-takeover--active" : ""}`}
        aria-hidden={!engulfing}
      >
        <PortalVortex className="portal-takeover__vortex" intense />
      </div>
    </>
  );
}
