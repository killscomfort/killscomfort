"use client";

import styles from "./ride.module.css";
import { blip, getCtx } from "./audioEngine";

export type CrateRecord = {
  t: string;
  s: string;
  gem: boolean;
};

type Props = {
  records: CrateRecord[];
  digIdx: number;
  onSelect: (index: number) => void;
  onPull: () => void;
  digMsg: string;
};

export function CrateDig({ records, digIdx, onSelect, onPull, digMsg }: Props) {
  const current = records[digIdx];

  const flip = (delta: number) => {
    const next = (digIdx + delta + records.length) % records.length;
    onSelect(next);
    const c = getCtx();
    blip(c ? c.currentTime : 0, 280 + next * 18);
  };

  return (
    <>
      <p className={styles.tiny} style={{ marginTop: 0 }}>
        FLIP · PULL · ONE GEM IN THE STACK
      </p>

      <div className={styles.crate}>
        <div
          className={`${styles.crateCover} ${current.gem ? styles.crateGem : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            const c = getCtx();
            blip(c ? c.currentTime : 0, 320);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const c = getCtx();
              blip(c ? c.currentTime : 0, 320);
            }
          }}
        >
          <div className={styles.crateArt}>
            {current.t.split(" ").map((word, i) => (
              <span key={i}>
                {word}
                <br />
              </span>
            ))}
          </div>
          <div className={styles.crateStamp}>{current.s}</div>
        </div>
        <p className={styles.crateCounter}>
          {digIdx + 1} / {records.length}
          {current.gem ? <span className={styles.crateGemTag}> · gem</span> : null}
        </p>
      </div>

      <div className={styles.digctl}>
        <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={() => flip(-1)}>
          ‹ Prev
        </button>
        <button type="button" className={`${styles.btn} ${styles.solid}`} onClick={onPull}>
          Pull this one
        </button>
        <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={() => flip(1)}>
          Next ›
        </button>
      </div>

      <p className={styles.digMsg}>{digMsg.includes("That's the one") ? <b>{digMsg}</b> : digMsg}</p>
    </>
  );
}
