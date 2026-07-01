import styles from "./portalVortex.module.css";

export function PortalVortex({
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
