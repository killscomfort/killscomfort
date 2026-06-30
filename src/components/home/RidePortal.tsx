"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./portal-cyclone.module.css";

function PortalVortex({
  className = "",
  intense = false,
}: {
  className?: string;
  intense?: boolean;
}) {
  return (
    <div
      className={`${styles.vortex} ${intense ? styles.vortexIntense : ""} ${className}`.trim()}
      aria-hidden
    >
      <div className={styles.glow} />
      <div className={`${styles.ring} ${styles.ringA}`} />
      <div className={`${styles.ring} ${styles.ringB}`} />
      <div className={`${styles.ring} ${styles.ringC}`} />
      <div className={styles.swirl} />
      <div className={styles.core} />
      <div className={styles.sparks} />
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
            Step through the cyclone. Build a beat, dig the crates, find what&apos;s stashed
            inside.
          </p>

          <p className={styles.status}>
            {"> "}mode: <span className={styles.statusAccent}>INTERACTIVE</span>
            {" // "}input: <span className={styles.statusAccent}>CLICK PORTAL</span>
          </p>
        </div>
      </section>

      <div
        className={`${styles.takeover} ${engulfing ? styles.takeoverActive : ""}`}
        aria-hidden={!engulfing}
      >
        <PortalVortex className={styles.takeoverVortex} intense />
      </div>
    </>
  );
}
