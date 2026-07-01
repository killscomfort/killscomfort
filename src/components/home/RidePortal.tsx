"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PortalVortex } from "@/components/portal/PortalVortex";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import styles from "./portal-cyclone.module.css";

export function RidePortal() {
  const router = useRouter();
  const { startPortalTransit, isActive } = usePortalTransit();
  const [hovered, setHovered] = useState(false);
  const [engulfing, setEngulfing] = useState(false);

  useEffect(() => {
    router.prefetch("/ride");
  }, [router]);

  useEffect(() => {
    if (isActive) setEngulfing(true);
  }, [isActive]);

  const enterPortal = useCallback(() => {
    if (engulfing) return;
    setEngulfing(true);
    startPortalTransit();
  }, [engulfing, startPortalTransit]);

  return (
    <section
      id="ride-portal"
      className={`${styles.portalSection} ${engulfing ? styles.portalSectionEngulfing : ""}`}
      aria-labelledby="ride-portal-heading"
    >
      <div className={styles.voidGlow} aria-hidden />

      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>Dimensional breach detected</p>
          <h2 id="ride-portal-heading" className={styles.title}>
            Enter the ride
          </h2>
        </motion.div>

        <motion.div
          className={styles.triggerWrap}
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className={styles.trigger}
            onClick={enterPortal}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={engulfing}
            aria-label="Open portal and enter the ride"
          >
            <PortalVortex intense={hovered || engulfing} />
            <span className={styles.triggerLabel}>
              <span className={styles.triggerGlyph}>◎</span>
              {engulfing ? "Jumping..." : "Fire portal"}
            </span>
          </button>
        </motion.div>

        <p className={styles.copy}>
          Step through the cyclone. Build a beat, dig the crates, find what&apos;s stashed inside.
        </p>

        <p className={styles.status}>
          {"> "}mode: <span className={styles.statusAccent}>INTERACTIVE</span>
          {" // "}input: <span className={styles.statusAccent}>CLICK PORTAL</span>
        </p>
      </div>
    </section>
  );
}
