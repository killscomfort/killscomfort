"use client";

import { useEffect, useRef, useState } from "react";
import type { CharacterType } from "./comfortRoomPalette";
import { PAL } from "./comfortRoomPalette";
import styles from "./street-run.module.css";

const W = 400;
const H = 280;
const HORIZON = 88;
const LANE_MIN = -2;
const LANE_MAX = 2;
const TOP_HW = 18;
const BOT_HW = 248;
const BASE_SPEED = 0.0055;
const MAX_SPEED = 0.03;
const SPEED_BUMP = 0.0035;
const SPEED_RAMP_MS = 30_000;

type Obstacle = {
  lane: number;
  t: number;
  kind: "cone" | "barrier" | "hydrant" | "trash" | "pothole";
  passed: boolean;
};

type Props = {
  character: CharacterType;
  onGameOver: (score: number) => void;
};

export default function StreetRunGame({ character, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const sc = canvasRef.current;
    if (!sc) return;
    const rawCtx = sc.getContext("2d");
    if (!rawCtx) return;
    const c: CanvasRenderingContext2D = rawCtx;
    c.imageSmoothingEnabled = false;

    const cx = W / 2;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    sc.width = W * dpr;
    sc.height = H * dpr;
    c.scale(dpr, dpr);

    const sg = {
      laneX: 0,
      targetLane: 0,
      speed: BASE_SPEED,
      speedTier: 0,
      startMs: performance.now(),
      dist: 0,
      obstacles: [] as Obstacle[],
      spawnTimer: 36,
      running: true,
      score: 0,
      frame: 0,
      reported: false,
    };

    function roadHalfWidthAt(t: number) {
      return TOP_HW + (BOT_HW - TOP_HW) * Math.pow(t, 1.65);
    }
    function yAt(t: number) {
      return HORIZON + (H - HORIZON) * Math.pow(t, 1.12);
    }
    function laneSpacingAt(t: number) {
      return roadHalfWidthAt(t) * 0.19;
    }
    function laneCenterAt(t: number, lane: number) {
      return cx + lane * laneSpacingAt(t);
    }

    function spawnObstacle() {
      const lane = LANE_MIN + Math.floor(Math.random() * (LANE_MAX - LANE_MIN + 1));
      const kinds: Obstacle["kind"][] = ["cone", "barrier", "hydrant", "trash", "pothole"];
      sg.obstacles.push({
        lane,
        t: 0.02,
        kind: kinds[Math.floor(Math.random() * kinds.length)],
        passed: false,
      });
    }

    function setLane(n: number) {
      sg.targetLane = Math.max(LANE_MIN, Math.min(LANE_MAX, n));
    }
    const laneLeft = () => setLane(sg.targetLane - 1);
    const laneRight = () => setLane(sg.targetLane + 1);

    const keyHandler = (e: KeyboardEvent) => {
      if (!sg.running) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") laneLeft();
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") laneRight();
    };
    window.addEventListener("keydown", keyHandler);

    const leftBtn = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;
    const fireLeft = (ev: Event) => {
      ev.preventDefault();
      laneLeft();
    };
    const fireRight = (ev: Event) => {
      ev.preventDefault();
      laneRight();
    };
    leftBtn?.addEventListener("touchstart", fireLeft, { passive: false });
    leftBtn?.addEventListener("mousedown", fireLeft);
    rightBtn?.addEventListener("touchstart", fireRight, { passive: false });
    rightBtn?.addEventListener("mousedown", fireRight);

    let touchStartX: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      touchStartX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 20) (dx < 0 ? laneLeft : laneRight)();
      touchStartX = null;
    };
    sc.addEventListener("touchstart", onTouchStart, { passive: true });
    sc.addEventListener("touchend", onTouchEnd, { passive: true });

    function drawSky() {
      const grad = c.createLinearGradient(0, 0, 0, HORIZON);
      grad.addColorStop(0, "#5eb3e8");
      grad.addColorStop(1, "#b8e4f8");
      c.fillStyle = grad;
      c.fillRect(0, 0, W, HORIZON);

      c.fillStyle = "#ffe566";
      c.beginPath();
      c.arc(W * 0.78, HORIZON * 0.38, 22, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.35)";
      c.beginPath();
      c.arc(W * 0.76, HORIZON * 0.36, 26, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#8aab8e";
      c.fillRect(0, HORIZON - 4, W, 8);

      c.fillStyle = "#6a8a72";
      let bx = -8;
      let seed = 0;
      while (bx < W + 8) {
        const bw = 18 + ((seed * 41) % 28);
        const bh = 12 + ((seed * 29) % 28);
        c.fillRect(bx, HORIZON - bh - 2, bw, bh);
        bx += bw + 6;
        seed++;
      }
    }

    function drawRoad() {
      c.fillStyle = "#5a9462";
      c.fillRect(0, HORIZON, W, H - HORIZON);

      c.beginPath();
      c.moveTo(cx - TOP_HW, HORIZON);
      c.lineTo(cx + TOP_HW, HORIZON);
      c.lineTo(cx + BOT_HW, H);
      c.lineTo(cx - BOT_HW, H);
      c.closePath();
      c.fillStyle = "#4a4a52";
      c.fill();

      const seg = 0.08;
      const offset = (sg.dist % seg) / seg;
      for (let i = -1; i < 16; i++) {
        const t0 = (i + offset) * seg;
        const t1b = (i + 1 + offset) * seg;
        if (t0 < 0 || t0 > 1) continue;
        c.fillStyle = i % 2 === 0 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.04)";
        const yA = yAt(Math.min(t0, 1));
        const yB = yAt(Math.min(t1b, 1));
        const hwA = roadHalfWidthAt(Math.min(t0, 1));
        const hwB = roadHalfWidthAt(Math.min(t1b, 1));
        c.beginPath();
        c.moveTo(cx - hwA, yA);
        c.lineTo(cx + hwA, yA);
        c.lineTo(cx + hwB, yB);
        c.lineTo(cx - hwB, yB);
        c.closePath();
        c.fill();
      }

      for (let lane = LANE_MIN; lane < LANE_MAX; lane++) {
        const boundary = lane + 0.5;
        for (let i = -1; i < 12; i++) {
          const t0 = (i + offset) * 0.12;
          const t1c = t0 + 0.055;
          if (t0 < 0 || t0 > 1) continue;
          const yA = yAt(Math.min(t0, 1));
          const yB = yAt(Math.min(t1c, 1));
          const xA = cx + boundary * laneSpacingAt(Math.min(t0, 1));
          const xB = cx + boundary * laneSpacingAt(Math.min(t1c, 1));
          c.strokeStyle = "rgba(255,255,255,0.75)";
          c.lineWidth = 1 + Math.min(t0, 1) * 2.5;
          c.beginPath();
          c.moveTo(xA, yA);
          c.lineTo(xB, yB);
          c.stroke();
        }
      }

      c.strokeStyle = "#f0e040";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(cx - TOP_HW, HORIZON);
      c.lineTo(cx - BOT_HW, H);
      c.stroke();
      c.beginPath();
      c.moveTo(cx + TOP_HW, HORIZON);
      c.lineTo(cx + BOT_HW, H);
      c.stroke();
    }

    function strokeOutline(fn: () => void, color = "#1a1a1a", width = 1.2) {
      c.strokeStyle = color;
      c.lineWidth = width;
      fn();
    }

    function drawObstacle(o: Obstacle) {
      const t = o.t;
      const y = yAt(t);
      const x = laneCenterAt(t, o.lane);
      const scale = 0.2 + Math.pow(t, 1.35) * 1.05;
      const s = 18 * scale;

      if (o.kind === "cone") {
        c.fillStyle = "#ff6a1a";
        c.beginPath();
        c.moveTo(x, y - s * 1.35);
        c.lineTo(x - s * 0.55, y);
        c.lineTo(x + s * 0.55, y);
        c.closePath();
        c.fill();
        strokeOutline(() => c.stroke());
        c.fillStyle = "#fff";
        c.fillRect(x - s * 0.42, y - s * 0.72, s * 0.84, s * 0.14);
        c.fillRect(x - s * 0.32, y - s * 0.48, s * 0.64, s * 0.12);
      } else if (o.kind === "barrier") {
        const bw = s * 1.1;
        const bh = s * 0.95;
        for (let i = 0; i < 4; i++) {
          c.fillStyle = i % 2 === 0 ? "#e83838" : "#fff";
          c.fillRect(x - bw / 2 + (i * bw) / 4, y - bh, bw / 4, bh);
        }
        strokeOutline(() => c.strokeRect(x - bw / 2, y - bh, bw, bh));
        c.fillStyle = "#888";
        c.fillRect(x - bw / 2 - 2, y - bh - 4, 4, bh + 4);
        c.fillRect(x + bw / 2 - 2, y - bh - 4, 4, bh + 4);
      } else if (o.kind === "hydrant") {
        c.fillStyle = "#e02020";
        c.fillRect(x - s * 0.28, y - s * 1.1, s * 0.56, s * 1.05);
        strokeOutline(() => c.strokeRect(x - s * 0.28, y - s * 1.1, s * 0.56, s * 1.05));
        c.fillStyle = "#c0c0c0";
        c.fillRect(x - s * 0.45, y - s * 0.55, s * 0.2, s * 0.18);
        c.fillRect(x + s * 0.25, y - s * 0.55, s * 0.2, s * 0.18);
        c.fillStyle = "#fff";
        c.fillRect(x - s * 0.12, y - s * 1.22, s * 0.24, s * 0.14);
      } else if (o.kind === "trash") {
        c.fillStyle = "#2a3540";
        c.fillRect(x - s * 0.45, y - s * 1.05, s * 0.9, s * 1.02);
        strokeOutline(() => c.strokeRect(x - s * 0.45, y - s * 1.05, s * 0.9, s * 1.02));
        c.fillStyle = "#4a5a68";
        c.fillRect(x - s * 0.38, y - s * 1.18, s * 0.76, s * 0.16);
        c.fillStyle = "rgba(255,255,255,0.25)";
        c.fillRect(x - s * 0.3, y - s * 0.85, s * 0.12, s * 0.5);
      } else {
        c.fillStyle = "rgba(0,0,0,0.55)";
        c.beginPath();
        c.ellipse(x, y, s * 0.85, s * 0.38, 0, 0, Math.PI * 2);
        c.fill();
        strokeOutline(() => {
          c.beginPath();
          c.ellipse(x, y, s * 0.85, s * 0.38, 0, 0, Math.PI * 2);
          c.stroke();
        });
        c.strokeStyle = "#2a2a30";
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(x, y, s * 0.55, s * 0.22, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    function drawBike() {
      const t = 0.96;
      const x = laneCenterAt(t, sg.laneX);
      const y = H - 8;
      const lean = (sg.targetLane - sg.laneX) * 12;
      const skin = character === "girl" ? PAL.skinG : PAL.skinB;
      const shirt = character === "girl" ? PAL.shirtG : PAL.shirtB;
      const hair = character === "girl" ? PAL.hairG : PAL.hairB;
      const pedal = sg.frame % 2 === 0 ? 1 : -1;

      c.save();
      c.translate(x, y);
      c.rotate(((lean * Math.PI) / 180) * 0.07);

      c.fillStyle = "rgba(0,0,0,0.2)";
      c.beginPath();
      c.ellipse(0, 6, 30, 8, 0, 0, Math.PI * 2);
      c.fill();

      const wheelY = 0;
      const wheelRx = 14;
      const wheelRy = 6;
      c.fillStyle = "#1a1a1a";
      c.beginPath();
      c.ellipse(-10, wheelY, wheelRx, wheelRy, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(10, wheelY, wheelRx, wheelRy, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#444";
      c.lineWidth = 1.5;
      c.beginPath();
      c.ellipse(-10, wheelY, wheelRx, wheelRy, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(10, wheelY, wheelRx, wheelRy, 0, 0, Math.PI * 2);
      c.stroke();

      c.strokeStyle = "#888";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-10, wheelY);
      c.lineTo(0, -28);
      c.lineTo(10, wheelY);
      c.stroke();
      c.beginPath();
      c.moveTo(0, -28);
      c.lineTo(0, -38);
      c.stroke();

      c.fillStyle = "#555";
      c.fillRect(-12, -40, 24, 4);

      c.fillStyle = shirt;
      c.fillRect(-13, -58, 26, 22);
      c.fillStyle = skin;
      c.fillRect(-22, -52, 10, 16);
      c.fillRect(12, -52, 10, 16);
      c.fillStyle = "#666";
      c.fillRect(-26, -54, 52, 4);

      c.fillStyle = skin;
      c.fillRect(-9, -72, 18, 16);
      c.fillStyle = hair;
      c.fillRect(-10, -74, 20, 8);

      c.strokeStyle = "#aaa";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-8, wheelY - 2);
      c.lineTo(-8 + pedal * 4, wheelY + 4);
      c.stroke();
      c.beginPath();
      c.moveTo(8, wheelY - 2);
      c.lineTo(8 - pedal * 4, wheelY + 4);
      c.stroke();

      c.restore();
    }

    function crash() {
      if (sg.reported) return;
      sg.reported = true;
      sg.running = false;
      const finalScore = Math.floor(sg.score);
      window.setTimeout(() => onGameOverRef.current(finalScore), 400);
    }

    function step() {
      sg.frame++;

      if (sg.running) {
        sg.laneX += (sg.targetLane - sg.laneX) * 0.2;
        sg.dist += sg.speed;
        sg.score += sg.speed * 48;

        const elapsed = performance.now() - sg.startMs;
        const tier = Math.floor(elapsed / SPEED_RAMP_MS);
        if (tier !== sg.speedTier) {
          sg.speedTier = tier;
          sg.speed = Math.min(MAX_SPEED, BASE_SPEED + tier * SPEED_BUMP);
        }

        sg.spawnTimer -= 1;
        if (sg.spawnTimer <= 0) {
          spawnObstacle();
          const difficulty = Math.min(20, Math.floor(sg.score / 150));
          sg.spawnTimer = Math.max(22, 48 - difficulty);
        }

        sg.obstacles.forEach((o) => {
          o.t += sg.speed * 1.55;
        });
        sg.obstacles = sg.obstacles.filter((o) => o.t < 1.08);

        for (const o of sg.obstacles) {
          if (!o.passed && o.t > 0.91) {
            o.passed = true;
            if (Math.abs(o.lane - sg.laneX) < 0.42) {
              crash();
            }
          }
        }
      }

      drawSky();
      drawRoad();
      sg.obstacles
        .slice()
        .sort((a, b) => a.t - b.t)
        .forEach(drawObstacle);
      drawBike();

      c.fillStyle = "#1a2a1a";
      c.font = "bold 12px monospace";
      c.textAlign = "left";
      c.fillText(`${Math.floor(sg.score)}`, 10, 22);
      c.font = "9px monospace";
      c.fillStyle = "#2a4a2a";
      c.fillText("SCORE", 10, 12);

      if (!sg.running && !sg.reported) {
        requestAnimationFrame(step);
        return;
      }
      if (sg.running) requestAnimationFrame(step);
    }

    step();

    return () => {
      window.removeEventListener("keydown", keyHandler);
      leftBtn?.removeEventListener("touchstart", fireLeft);
      leftBtn?.removeEventListener("mousedown", fireLeft);
      rightBtn?.removeEventListener("touchstart", fireRight);
      rightBtn?.removeEventListener("mousedown", fireRight);
      sc.removeEventListener("touchstart", onTouchStart);
      sc.removeEventListener("touchend", onTouchEnd);
    };
  }, [character]);

  return (
    <div className={styles.shell}>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div className={`${styles.touchBar} ${isTouch ? "" : styles.touchBarHidden}`}>
        <button ref={leftBtnRef} type="button" className={styles.laneBtn} aria-label="Move left">
          ◀
        </button>
        <span className={styles.swipeHint}>swipe · 5 lanes</span>
        <button ref={rightBtnRef} type="button" className={styles.laneBtn} aria-label="Move right">
          ▶
        </button>
      </div>
    </div>
  );
}
