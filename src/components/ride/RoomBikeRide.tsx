"use client";

import { useEffect, useRef, useState } from "react";
import type { CharacterType } from "./comfortRoomPalette";
import { PAL } from "./comfortRoomPalette";
import styles from "./comfortRoom.module.css";

type Props = {
  character: CharacterType;
  onComplete: () => void;
  winScore?: number;
};

export default function RoomBikeRide({ character, onComplete, winScore = 90 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
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

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const W2 = 384;
    const H2 = 240;
    const horizonY = 78;
    const cx = W2 / 2;
    const topHalfWidth = 16;
    const bottomHalfWidth = 230;

    const sg = {
      laneX: 0,
      targetLane: 0,
      speed: 0.011,
      dist: 0,
      obstacles: [] as { lane: number; t: number; kind: string; passed: boolean }[],
      spawnTimer: 0,
      running: true,
      score: 0,
      won: false,
    };

    function roadHalfWidthAt(t: number) {
      return topHalfWidth + (bottomHalfWidth - topHalfWidth) * Math.pow(t, 1.7);
    }
    function yAt(t: number) {
      return horizonY + (H2 - horizonY) * Math.pow(t, 1.15);
    }
    function laneCenterAt(t: number, lane: number) {
      const hw = roadHalfWidthAt(t);
      return cx + lane * hw * 0.42;
    }

    function spawnObstacle() {
      const lane = Math.floor(Math.random() * 3) - 1;
      const kinds = ["cone", "pothole", "crate", "log"];
      sg.obstacles.push({
        lane,
        t: 0.02,
        kind: kinds[Math.floor(Math.random() * kinds.length)],
        passed: false,
      });
    }

    function setLane(n: number) {
      sg.targetLane = Math.max(-1, Math.min(1, n));
    }
    const laneLeft = () => setLane(sg.targetLane - 1);
    const laneRight = () => setLane(sg.targetLane + 1);

    const keyHandler = (e: KeyboardEvent) => {
      if (!sg.running) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") laneLeft();
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") laneRight();
    };
    window.addEventListener("keydown", keyHandler);

    const leftBtn = document.getElementById("laneLeftBtn");
    const rightBtn = document.getElementById("laneRightBtn");
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
      touchStartX = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 24) (dx < 0 ? laneLeft : laneRight)();
      touchStartX = null;
    };
    sc.addEventListener("touchstart", onTouchStart, { passive: true });
    sc.addEventListener("touchend", onTouchEnd, { passive: true });

    function drawSky() {
      const grad = c.createLinearGradient(0, 0, 0, horizonY);
      grad.addColorStop(0, "#241c2e");
      grad.addColorStop(1, "#3a2c38");
      c.fillStyle = grad;
      c.fillRect(0, 0, W2, horizonY);
      c.fillStyle = "#1a1420";
      let bx = -10;
      let seed = 0;
      while (bx < W2 + 10) {
        const bw = 20 + ((seed * 37) % 30);
        const bh = 14 + ((seed * 53) % 34);
        c.fillRect(bx, horizonY - bh, bw, bh);
        bx += bw + 4;
        seed++;
      }
    }

    function drawRoad() {
      c.fillStyle = "#15201a";
      c.fillRect(0, horizonY, W2, H2 - horizonY);
      c.beginPath();
      c.moveTo(cx - topHalfWidth, horizonY);
      c.lineTo(cx + topHalfWidth, horizonY);
      c.lineTo(cx + bottomHalfWidth, H2);
      c.lineTo(cx - bottomHalfWidth, H2);
      c.closePath();
      c.fillStyle = "#2a2a30";
      c.fill();

      const seg = 0.085;
      const offset = (sg.dist % seg) / seg;
      for (let i = -1; i < 14; i++) {
        const t0 = (i + offset) * seg;
        const t1b = (i + 1 + offset) * seg;
        if (t0 < 0 || t0 > 1) continue;
        const dark = i % 2 === 0;
        c.fillStyle = dark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.03)";
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

      [-0.5, 0.5].forEach((boundary) => {
        for (let i = -1; i < 10; i++) {
          const t0 = (i + offset) * 0.14;
          const t1c = t0 + 0.07;
          if (t0 < 0 || t0 > 1) continue;
          const yA = yAt(Math.min(t0, 1));
          const yB = yAt(Math.min(t1c, 1));
          const xA = cx + boundary * 2 * roadHalfWidthAt(Math.min(t0, 1)) * 0.42;
          const xB = cx + boundary * 2 * roadHalfWidthAt(Math.min(t1c, 1)) * 0.42;
          const w0 = 1 + 2 * t0;
          const w1 = 1 + 2 * t1c;
          c.strokeStyle = "rgba(216,212,200,0.5)";
          c.lineWidth = (w0 + w1) / 2;
          c.beginPath();
          c.moveTo(xA, yA);
          c.lineTo(xB, yB);
          c.stroke();
        }
      });

      c.strokeStyle = "#4a3a3a";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(cx - topHalfWidth, horizonY);
      c.lineTo(cx - bottomHalfWidth, H2);
      c.stroke();
      c.beginPath();
      c.moveTo(cx + topHalfWidth, horizonY);
      c.lineTo(cx + bottomHalfWidth, H2);
      c.stroke();
    }

    function obstacleColor(kind: string) {
      return ({ cone: "#c46a2a", pothole: "#0c0c0e", crate: "#7a5a36", log: "#5a4028" } as Record<string, string>)[kind] || "#888";
    }

    function drawObstacle(o: (typeof sg.obstacles)[0]) {
      const t = o.t;
      const y = yAt(t);
      const x = laneCenterAt(t, o.lane);
      const scale = 0.18 + 0.95 * Math.pow(t, 1.4);
      const size = 16 * scale;
      c.fillStyle = obstacleColor(o.kind);
      if (o.kind === "pothole") {
        c.beginPath();
        c.ellipse(x, y, size * 0.9, size * 0.4, 0, 0, Math.PI * 2);
        c.fill();
      } else if (o.kind === "cone") {
        c.beginPath();
        c.moveTo(x, y - size * 1.3);
        c.lineTo(x - size * 0.55, y);
        c.lineTo(x + size * 0.55, y);
        c.closePath();
        c.fill();
        c.fillStyle = "#e8e0cc";
        c.fillRect(x - size * 0.4, y - size * 0.55, size * 0.8, size * 0.16);
      } else if (o.kind === "crate") {
        c.fillRect(x - size * 0.55, y - size * 1.05, size * 1.1, size * 1.05);
        c.strokeStyle = "rgba(0,0,0,0.4)";
        c.lineWidth = Math.max(1, size * 0.06);
        c.strokeRect(x - size * 0.55, y - size * 1.05, size * 1.1, size * 1.05);
      } else {
        c.save();
        c.translate(x, y - size * 0.3);
        c.rotate(0.1);
        c.fillRect(-size * 0.7, -size * 0.25, size * 1.4, size * 0.5);
        c.restore();
      }
    }

    function drawBike() {
      const t = 0.97;
      const x = laneCenterAt(t, sg.laneX);
      const y = H2 - 6;
      const lean = (sg.targetLane - sg.laneX) * 10;
      const skin = character === "girl" ? PAL.skinG : PAL.skinB;
      const shirt = character === "girl" ? PAL.shirtG : PAL.shirtB;
      const hair = character === "girl" ? PAL.hairG : PAL.hairB;

      c.save();
      c.translate(x, y);
      c.rotate(((lean * Math.PI) / 180) * 0.06);
      c.fillStyle = "rgba(0,0,0,0.35)";
      c.beginPath();
      c.ellipse(0, 4, 26, 7, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#161616";
      c.beginPath();
      c.ellipse(0, -2, 17, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#2a2a2a";
      c.beginPath();
      c.ellipse(0, -2, 9, 4, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = shirt;
      c.fillRect(-16, -52, 32, 38);
      c.fillStyle = skin;
      c.fillRect(-24, -40, 9, 22);
      c.fillRect(15, -40, 9, 22);
      c.fillStyle = skin;
      c.fillRect(-11, -68, 22, 20);
      c.fillStyle = hair;
      c.fillRect(-12, -70, 24, 10);
      c.restore();
    }

    function showCrash() {
      c.fillStyle = "rgba(20,4,4,0.55)";
      c.fillRect(0, 0, W2, H2);
      c.fillStyle = "#e8d8d4";
      c.font = "15px monospace";
      c.textAlign = "center";
      c.fillText("— wiped out —", W2 / 2, H2 / 2 - 14);
      c.font = "10px monospace";
      c.fillStyle = "#b8a8a0";
      c.fillText(`score ${Math.floor(sg.score)}`, W2 / 2, H2 / 2 + 8);
      c.fillText("space / tap to try again", W2 / 2, H2 / 2 + 26);
    }

    function showWin() {
      c.fillStyle = "rgba(8,20,12,0.55)";
      c.fillRect(0, 0, W2, H2);
      c.fillStyle = "#d8f0d8";
      c.font = "15px monospace";
      c.textAlign = "center";
      c.fillText("— you made it —", W2 / 2, H2 / 2 - 14);
      c.font = "10px monospace";
      c.fillStyle = "#a8c8a8";
      c.fillText("rolling into miami...", W2 / 2, H2 / 2 + 10);
    }

    function restart() {
      sg.laneX = 0;
      sg.targetLane = 0;
      sg.dist = 0;
      sg.obstacles = [];
      sg.spawnTimer = 0;
      sg.running = true;
      sg.score = 0;
      sg.speed = 0.011;
      sg.won = false;
      requestAnimationFrame(step);
    }

    const restartHandler = (e: KeyboardEvent) => {
      if (sg.running || sg.won) return;
      if (e.key !== " ") return;
      restart();
    };
    const restartTouch = () => {
      if (!sg.running && !sg.won) restart();
    };
    window.addEventListener("keydown", restartHandler);
    sc.addEventListener("touchstart", restartTouch);

    let winTimer: ReturnType<typeof setTimeout> | null = null;

    function step() {
      if (!sg.running && !sg.won) return;

      if (sg.running) {
        sg.laneX += (sg.targetLane - sg.laneX) * 0.18;
        sg.dist += sg.speed;
        sg.score += sg.speed * 40;
        sg.speed = Math.min(0.022, sg.speed + 0.0000045);

        sg.spawnTimer -= 1;
        if (sg.spawnTimer <= 0) {
          spawnObstacle();
          sg.spawnTimer = 46 - Math.min(20, sg.score / 20);
        }

        sg.obstacles.forEach((o) => {
          o.t += sg.speed * 1.5;
        });
        sg.obstacles = sg.obstacles.filter((o) => o.t < 1.06);

        for (const o of sg.obstacles) {
          if (!o.passed && o.t > 0.93) {
            o.passed = true;
            if (Math.abs(o.lane - sg.laneX) < 0.55) {
              sg.running = false;
            }
          }
        }

        if (sg.score >= winScore && !sg.won) {
          sg.won = true;
          sg.running = false;
          winTimer = setTimeout(() => onCompleteRef.current(), 1400);
        }
      }

      drawSky();
      drawRoad();
      sg.obstacles
        .slice()
        .sort((a, b) => a.t - b.t)
        .forEach(drawObstacle);
      drawBike();

      c.fillStyle = "#d8d4c8";
      c.font = "10px monospace";
      c.textAlign = "left";
      c.fillText(`score ${Math.floor(sg.score)}`, 10, 18);
      if (!isTouch) {
        c.textAlign = "right";
        c.fillText("← / → to steer", W2 - 10, 18);
      }

      if (sg.won) {
        showWin();
        return;
      }
      if (!sg.running) {
        showCrash();
        return;
      }
      requestAnimationFrame(step);
    }

    step();

    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("keydown", restartHandler);
      leftBtn?.removeEventListener("touchstart", fireLeft);
      leftBtn?.removeEventListener("mousedown", fireLeft);
      rightBtn?.removeEventListener("touchstart", fireRight);
      rightBtn?.removeEventListener("mousedown", fireRight);
      sc.removeEventListener("touchstart", onTouchStart);
      sc.removeEventListener("touchend", onTouchEnd);
      sc.removeEventListener("touchstart", restartTouch);
      if (winTimer) clearTimeout(winTimer);
    };
  }, [character, winScore]);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} width={384} height={240} />
      <div className={`${styles.touchControls} ${isTouch ? styles.touchOn : ""}`}>
        <div className={`${styles.tBtn} ${styles.laneLeftBtn}`} id="laneLeftBtn">
          ◀
        </div>
        <div className={`${styles.tBtn} ${styles.laneRightBtn}`} id="laneRightBtn">
          ▶
        </div>
      </div>
    </div>
  );
}
