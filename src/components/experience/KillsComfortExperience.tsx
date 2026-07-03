"use client";

/**
 * KillsComfortExperience
 * -----------------------
 * Full-viewport wrapper that mounts the self-contained KillsComfort "ride"
 * experience in an isolated iframe.
 *
 * The experience itself is vanilla HTML/CSS/Canvas and lives in /public:
 *   public/experience/index.html   -> markup (canvases, HUD, panel mount)
 *   public/experience/styles.css   -> all styling (scoped under #kc)
 *   public/experience/game.js      -> all game logic (arrival, warehouse,
 *                                     bike picker, merch store, crates +
 *                                     turntable, beat maker, arcade, checkout)
 *
 * Why an iframe?
 * The game is an imperative Canvas/DOM app with its own RAF loops and global
 * listeners. Isolating it in an iframe keeps it away from React's lifecycle
 * (StrictMode double-mounts, HMR) and prevents id/style collisions with the
 * rest of your Next.js app. You keep editing the three files above in Cursor
 * and just refresh — no rebuild, no React gymnastics.
 *
 * If you later want it inline (no iframe), you can inject index.html's body
 * and run game.js in a useEffect, but the iframe is the robust default.
 */
export default function KillsComfortExperience({
  src = "/experience/index.html",
  className,
}: {
  src?: string;
  className?: string;
}) {
  return (
    <iframe
      src={src}
      title="KillsComfort — Ride"
      className={className}
      allow="autoplay; fullscreen; clipboard-write"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        border: "none",
        background: "#0a0a0c",
        display: "block",
      }}
    />
  );
}
