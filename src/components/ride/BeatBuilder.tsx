"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ride.module.css";
import {
  getCtx,
  Sequencer,
  LANES,
  LANE_LABELS,
  STEPS,
  emptyGrid,
  starterGrid,
  trigger,
  type Grid,
  type Lane,
} from "./audioEngine";

type Props = { onBeatLocked: () => void; locked: boolean };

export default function BeatBuilder({ onBeatLocked, locked }: Props) {
  const [grid, setGrid] = useState<Grid>(() => emptyGrid());
  const [bpm, setBpm] = useState(96);
  const [playing, setPlaying] = useState(false);
  const [head, setHead] = useState(-1);

  const gridRef = useRef(grid);
  const bpmRef = useRef(bpm);
  gridRef.current = grid;
  bpmRef.current = bpm;

  const seq = useMemo(
    () =>
      new Sequencer(
        () => gridRef.current,
        () => bpmRef.current,
        (i) => setHead(i)
      ),
    []
  );

  useEffect(() => {
    return () => seq.stop();
  }, [seq]);

  const checkLock = (g: Grid) => {
    if (locked) return;
    const hits = LANES.reduce((n, l) => n + g[l].filter(Boolean).length, 0);
    const lanesUsed = LANES.filter((l) => g[l].some(Boolean)).length;
    if (hits >= 4 && lanesUsed >= 2) onBeatLocked();
  };

  const toggle = (lane: Lane, i: number) => {
    getCtx();
    setGrid((prev) => {
      const next: Grid = { ...prev, [lane]: prev[lane].slice() };
      next[lane][i] = !prev[lane][i];
      if (next[lane][i]) {
        const c = getCtx();
        trigger(lane, c ? c.currentTime : 0, i);
      }
      checkLock(next);
      return next;
    });
  };

  const togglePlay = () => {
    getCtx();
    if (playing) {
      seq.stop();
      setPlaying(false);
      setHead(-1);
    } else {
      seq.start();
      setPlaying(true);
    }
  };

  const clear = () => {
    setGrid(emptyGrid());
  };
  const seed = () => {
    getCtx();
    const g = starterGrid();
    setGrid(g);
    checkLock(g);
  };

  return (
    <>
      <div className={styles.transport}>
        <button className={`${styles.btn} ${styles.solid}`} onClick={togglePlay}>
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={clear}>
          Clear
        </button>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={seed}>
          Drop a starter
        </button>
        <span className={styles.bpm}>
          BPM
          <input type="range" min={78} max={150} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          <b>{bpm}</b>
        </span>
      </div>

      <div className={styles.seq}>
        {LANES.map((lane) => (
          <div className={styles.track} key={lane}>
            <div className={styles.lbl}>{LANE_LABELS[lane]}</div>
            <div className={styles.steps}>
              {Array.from({ length: STEPS }).map((_, i) => {
                const on = grid[lane][i];
                const cls = [
                  styles.cell,
                  i % 4 === 0 ? styles.cellBeat : "",
                  on ? styles.cellOn : "",
                  head === i ? styles.cellPlay : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={i}
                    className={cls}
                    aria-label={`${LANE_LABELS[lane]} step ${i + 1}`}
                    onClick={() => toggle(lane, i)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.beathint}>
        Tap the grid to place hits. <b>4 lanes:</b> kick, snare, hat, bass — 16 steps a bar.
        <br />
        Lock something that moves and the warehouse <b>unlocks a secret mix.</b>
      </div>
    </>
  );
}
