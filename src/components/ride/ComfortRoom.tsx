"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterType } from "./comfortRoomPalette";
import { H, OBJECTS, ROOM, TILE, W } from "./comfortRoomPalette";
import { drawRoom, drawSprite } from "./comfortRoomDraw";
import styles from "./comfortRoom.module.css";

type Props = {
  onLeave: (character: CharacterType) => void;
  onSkip?: () => void;
  audioSrc?: string;
};

const SPRITE_W = 14;
const SPRITE_H = 10;

function objRect(o: (typeof OBJECTS)[0]) {
  return { x: o.tx * TILE, y: o.ty * TILE, w: o.w * TILE, h: o.h * TILE };
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerFootRect(px: number, py: number) {
  return { x: px + 1, y: py + 16, w: SPRITE_W, h: SPRITE_H };
}

function blocked(nx: number, ny: number) {
  const foot = playerFootRect(nx, ny);
  const bx0 = ROOM.x0 * TILE;
  const by0 = ROOM.y0 * TILE;
  const bx1 = ROOM.x1 * TILE;
  const by1 = ROOM.y1 * TILE;

  if (foot.x < bx0 || foot.x + foot.w > bx1 || foot.y < by0 || foot.y + foot.h > by1) {
    const d = OBJECTS.find((o) => o.id === "door")!;
    const doorRect = objRect(d);
    if (rectsOverlap(foot, { x: doorRect.x, y: doorRect.y - 4, w: doorRect.w, h: doorRect.h + 8 })) {
      return false;
    }
    return true;
  }

  for (const o of OBJECTS) {
    if (o.id === "door") continue;
    if (rectsOverlap(foot, objRect(o))) return true;
  }
  return false;
}

function CharPickIcon({ type }: { type: CharacterType }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const c = cvs.getContext("2d");
    if (!c) return;
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, 32, 48);
    drawSprite(c, type, 4, 2, "down", 0, 1.6);
  }, [type]);
  return <canvas ref={ref} width={32} height={48} />;
}

export default function ComfortRoom({ onLeave, onSkip, audioSrc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  const [chosen, setChosen] = useState<CharacterType | null>(null);
  const [overlay, setOverlay] = useState<{ title: string; text: string } | null>(null);
  const [engulfing, setEngulfing] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const gameRef = useRef({
    px: 12 * TILE,
    py: 7 * TILE,
    facing: "down",
    frame: 0,
    frameTimer: 0,
    danceTimer: 0,
    keys: {} as Record<string, boolean>,
    frozen: false,
    nearObj: null as (typeof OBJECTS)[0] | null,
    dancing: false,
    engulfing: false,
  });

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const toggleMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) {
      el.pause();
      setMusicPlaying(false);
    } else {
      const p = el.play();
      setMusicPlaying(true);
      if (p?.catch) p.catch(() => undefined);
    }
  }, [musicPlaying]);

  const closeOverlay = useCallback(() => {
    setOverlay(null);
    gameRef.current.frozen = false;
  }, []);

  const beginLeave = useCallback(() => {
    if (gameRef.current.engulfing || !chosen) return;
    gameRef.current.engulfing = true;
    gameRef.current.frozen = true;
    setEngulfing(true);
    window.setTimeout(() => onLeaveRef.current(chosen), 950);
  }, [chosen]);

  const tryInteract = useCallback(() => {
    const g = gameRef.current;
    if (g.frozen || !g.nearObj || !chosen) return;
    if (g.nearObj.id === "door") {
      beginLeave();
      return;
    }
    g.frozen = true;
    setOverlay({ title: g.nearObj.title, text: g.nearObj.text });
  }, [beginLeave, chosen]);

  const toggleDance = useCallback(() => {
    const g = gameRef.current;
    if (g.frozen || !chosen) return;
    g.dancing = !g.dancing;
    if (g.dancing && !musicPlaying) toggleMusic();
  }, [chosen, musicPlaying, toggleMusic]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = true;
      if (e.key === "e" || e.key === "E") tryInteract();
      if (e.key === "f" || e.key === "F") toggleDance();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [tryInteract, toggleDance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chosen) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      const g = gameRef.current;

      if (!g.frozen && chosen) {
        let dx = 0;
        let dy = 0;
        const speed = 1.6;
        if (g.keys.ArrowUp) {
          dy -= speed;
          g.facing = "up";
        }
        if (g.keys.ArrowDown) {
          dy += speed;
          g.facing = "down";
        }
        if (g.keys.ArrowLeft) {
          dx -= speed;
          g.facing = "left";
        }
        if (g.keys.ArrowRight) {
          dx += speed;
          g.facing = "right";
        }

        const moving = dx !== 0 || dy !== 0;
        if (moving) {
          g.dancing = false;
          g.frameTimer += dt;
          if (g.frameTimer > 140) {
            g.frame = 1 - g.frame;
            g.frameTimer = 0;
          }
        } else if (g.dancing) {
          g.danceTimer += dt;
          if (g.danceTimer > 160) {
            g.frame = 1 - g.frame;
            g.danceTimer = 0;
          }
        } else {
          g.frame = 0;
        }

        if (dx !== 0) {
          const nx = g.px + dx;
          if (!blocked(nx, g.py)) g.px = nx;
        }
        if (dy !== 0) {
          const ny = g.py + dy;
          if (!blocked(g.px, ny)) g.py = ny;
        }

        const foot = playerFootRect(g.px, g.py);
        let near: (typeof OBJECTS)[0] | null = null;
        for (const o of OBJECTS) {
          const r = objRect(o);
          const expanded = { x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 12 };
          if (rectsOverlap(foot, expanded)) {
            near = o;
            break;
          }
        }
        g.nearObj = near;
      }

      drawRoom(ctx, W, H, {
        chosen,
        px: g.px,
        py: g.py,
        facing: g.facing,
        frame: g.frame,
        dancing: g.dancing,
        nearObj: g.nearObj,
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [chosen]);

  const bindHold = (el: HTMLElement | null, keyName: string) => {
    if (!el) return;
    const start = (ev: Event) => {
      ev.preventDefault();
      gameRef.current.keys[keyName] = true;
    };
    const end = (ev: Event) => {
      ev.preventDefault();
      gameRef.current.keys[keyName] = false;
    };
    el.addEventListener("touchstart", start, { passive: false });
    el.addEventListener("touchend", end, { passive: false });
    el.addEventListener("touchcancel", end, { passive: false });
    el.addEventListener("mousedown", start);
    const up = (ev: Event) => end(ev);
    window.addEventListener("mouseup", up);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
      el.removeEventListener("mousedown", start);
      window.removeEventListener("mouseup", up);
    };
  };

  useEffect(() => {
    if (!isTouch || !chosen) return;
    const cleanups = [
      bindHold(document.getElementById("dUp"), "ArrowUp"),
      bindHold(document.getElementById("dDown"), "ArrowDown"),
      bindHold(document.getElementById("dLeft"), "ArrowLeft"),
      bindHold(document.getElementById("dRight"), "ArrowRight"),
    ];
    return () => cleanups.forEach((fn) => fn?.());
  }, [isTouch, chosen]);

  const fireInteract = (ev: React.SyntheticEvent) => {
    ev.preventDefault();
    tryInteract();
  };

  return (
    <div className={styles.wrap}>
      {!chosen && (
        <div className={styles.charSelect}>
          <h1>killscomfort</h1>
          <div className={styles.sub}>choose your character</div>
          <div className={styles.pickRow}>
            <button type="button" className={styles.pickBtn} onClick={() => setChosen("boy")}>
              <CharPickIcon type="boy" />
              <span>boy</span>
            </button>
            <button type="button" className={styles.pickBtn} onClick={() => setChosen("girl")}>
              <CharPickIcon type="girl" />
              <span>girl</span>
            </button>
          </div>
          {onSkip && (
            <button type="button" className={styles.skipLink} onClick={onSkip}>
              skip to warehouse
            </button>
          )}
        </div>
      )}

      {chosen && (
        <>
          <div className={styles.title}>killscomfort</div>
          <canvas ref={canvasRef} className={styles.canvas} width={W} height={H} />
          <div className={styles.hint}>
            {isTouch ? "d-pad to move · E interact · 🕺 dance" : "arrow keys to move · E to interact · F to dance"}
          </div>

          <div className={`${styles.touchControls} ${isTouch ? styles.touchOn : ""}`}>
            <div className={styles.dpad} id="dpad">
              <div className={`${styles.tBtn} ${styles.dUp}`} id="dUp">
                ▲
              </div>
              <div className={`${styles.tBtn} ${styles.dDown}`} id="dDown">
                ▼
              </div>
              <div className={`${styles.tBtn} ${styles.dLeft}`} id="dLeft">
                ◀
              </div>
              <div className={`${styles.tBtn} ${styles.dRight}`} id="dRight">
                ▶
              </div>
            </div>
            <button type="button" className={`${styles.tBtn} ${styles.interactBtn}`} onMouseDown={fireInteract} onTouchStart={fireInteract}>
              E
            </button>
            <button
              type="button"
              className={`${styles.tBtn} ${styles.danceBtn}`}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleDance();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                toggleDance();
              }}
            >
              🕺
            </button>
          </div>

          <div className={`${styles.player} ${musicPlaying ? styles.playerPlaying : ""}`}>
            <div className={styles.pTop}>
              <button type="button" className={styles.playPause} aria-label="play" onClick={toggleMusic}>
                {musicPlaying ? "❚❚" : "▶"}
              </button>
              <div className={styles.pMeta}>
                <div className={styles.pTrack}>thisdickaintfree</div>
                <div className={styles.pArtist}>killscomfort</div>
              </div>
              <div className={styles.eq}>
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            {audioSrc ? (
              <audio ref={audioRef} loop preload="auto" src={audioSrc} />
            ) : (
              <audio ref={audioRef} loop preload="none" />
            )}
          </div>
        </>
      )}

      <div className={`${styles.overlay} ${overlay ? styles.overlayOn : ""}`}>
        <div className={styles.overlayBox}>
          <h2>{overlay?.title}</h2>
          <p>{overlay?.text}</p>
          <button type="button" onClick={closeOverlay}>
            close
          </button>
        </div>
      </div>

      <div className={`${styles.fade} ${engulfing ? styles.fadeOn : ""}`} />
    </div>
  );
}
