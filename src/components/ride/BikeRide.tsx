"use client";

import { useEffect, useRef } from "react";
import styles from "./ride.module.css";
import { getCtx, blip } from "./audioEngine";

type Props = {
  onArrive: () => void;
  onCollect: (value: string) => void;
};

const VALUES = ["CURIOSITY", "COMMUNITY", "DISCIPLINE"];
const RUNWAY = 1100; // world distance from "all tags collected" to the warehouse door

export default function BikeRide({ onArrive, onCollect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const onArriveRef = useRef(onArrive);
  const onCollectRef = useRef(onCollect);
  onArriveRef.current = onArrive;
  onCollectRef.current = onCollect;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
    let W = 0;
    let H = 0;

    type Token = { x: number; bandFrac: number; v: string };
    type Pop = { x: number; y: number; text: string; life: number };
    type Win = { x: number; y: number; w: number; h: number; on: boolean };
    type Bld = { x: number; w: number; h: number };

    const S = {
      dist: 0,
      scroll: 0,
      ground: 0,
      rider: { y: 0, vy: 0 },
      tokens: [] as Token[],
      pops: [] as Pop[],
      lights: [] as number[],
      windows: [] as Win[],
      buildings: [] as Bld[],
      escapes: [] as number[],
      graffiti: [] as { x: number; y: number; r: number }[],
      dumpsters: [] as number[],
      rain: [] as { x: number; y: number; len: number; sp: number }[],
      phase: "ride" as "ride" | "arrive",
      arrive: 0,
      arrived: false,
      unlocked: false,
      warehouseX: 0,
      runwayStart: 0,
      flick: 1,
      inited: false,
    };

    const RIDER_SX = () => W * 0.3;
    const w2s = (wx: number) => RIDER_SX() + (wx - S.dist);
    const loopX = (start: number, factor: number, span: number) => {
      let x = (start - S.scroll * factor) % span;
      if (x < 0) x += span;
      return x;
    };
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tokenY = (tk: Token) => S.ground - 120 - tk.bandFrac * 80;

    // layout = recomputed on every resize; gameplay (tokens/unlock) only initialized once
    function layout() {
      S.ground = H * 0.8;
      S.lights = [];
      for (let i = 0; i < 14; i++) S.lights.push(320 + i * 330);
      S.buildings = [];
      for (let i = 0; i < 14; i++)
        S.buildings.push({ x: i * 150 + Math.random() * 40, w: 80 + Math.random() * 70, h: 90 + Math.random() * 150 });
      S.windows = [];
      for (let i = 0; i < 44; i++)
        S.windows.push({
          x: i * 64 + Math.random() * 24,
          y: H * 0.16 + Math.random() * H * 0.36,
          w: 7 + Math.random() * 7,
          h: 9 + Math.random() * 12,
          on: Math.random() < 0.32,
        });
      S.escapes = [];
      for (let i = 0; i < 7; i++) S.escapes.push(i * 280 + Math.random() * 80);
      S.graffiti = [];
      for (let i = 0; i < 10; i++)
        S.graffiti.push({ x: i * 220 + Math.random() * 120, y: S.ground - 30 - Math.random() * 90, r: 10 + Math.random() * 22 });
      S.dumpsters = [];
      for (let i = 0; i < 5; i++) S.dumpsters.push(i * 520 + 260 + Math.random() * 120);
      S.rain = [];
      if (!reduce)
        for (let i = 0; i < 70; i++)
          S.rain.push({ x: Math.random() * W, y: Math.random() * H, len: 7 + Math.random() * 12, sp: 0.55 + Math.random() * 0.5 });
      if (!S.inited) {
        S.tokens = [];
        let vx = 560;
        VALUES.forEach((v) => {
          S.tokens.push({ x: vx, bandFrac: Math.random(), v });
          vx += 560;
        });
        S.inited = true;
      }
    }

    function resize() {
      const r = wrap!.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas!.width = Math.max(1, W * DPR);
      canvas!.height = Math.max(1, H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      layout();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const hop = () => {
      if (S.rider.y === 0) {
        S.rider.vy = -1.05;
        const c = getCtx();
        blip(c ? c.currentTime : 0, 420);
      }
    };
    const onPointer = (e: PointerEvent) => {
      e.preventDefault();
      hop();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        hop();
      }
    };
    canvas.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);

    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min(40, now - last);
      last = now;
      if (!S.inited) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const speed = 0.24;

      if (S.phase === "ride") {
        S.dist += dt * speed;
        S.scroll += dt * speed;
        S.rider.vy += 0.0026 * dt;
        S.rider.y += S.rider.vy * dt;
        if (S.rider.y > 0) {
          S.rider.y = 0;
          S.rider.vy = 0;
        }
        const rx = RIDER_SX();
        const ry = S.ground - 30 + S.rider.y;

        // collect + recycle (uncollected tags loop back around so the ride never dead-ends)
        for (let i = S.tokens.length - 1; i >= 0; i--) {
          const tk = S.tokens[i];
          const sx = w2s(tk.x);
          const ty = tokenY(tk) + Math.sin(now / 300 + tk.x) * 6;
          if (Math.abs(sx - rx) < 30 && Math.abs(ty - ry) < 34) {
            S.tokens.splice(i, 1);
            onCollectRef.current(tk.v);
            const c = getCtx();
            blip(c ? c.currentTime : 0, 680);
            S.pops.push({ x: rx, y: ty, text: "+" + tk.v, life: 1 });
            if (S.tokens.length === 0) {
              S.unlocked = true;
              S.runwayStart = S.dist;
              S.warehouseX = S.dist + RUNWAY;
              if (hintRef.current) hintRef.current.textContent = "WAREHOUSE UNLOCKED → ROLL IN";
            }
            continue;
          }
          if (sx < -60) {
            let maxX = S.dist;
            for (const o of S.tokens) if (o.x > maxX) maxX = o.x;
            tk.x = Math.max(S.dist + 760, maxX + 520);
            tk.bandFrac = Math.random();
          }
        }

        if (S.unlocked && S.dist >= S.warehouseX) {
          S.phase = "arrive";
          if (hintRef.current) hintRef.current.style.display = "none";
        }
      } else {
        S.arrive += dt / 1500;
        if (S.arrive >= 1 && !S.arrived) {
          S.arrived = true;
          cancelAnimationFrame(raf);
          onArriveRef.current();
          return;
        }
      }

      S.flick = 0.72 + Math.random() * 0.28;
      for (const p of S.pops) p.life -= dt / 1000;
      S.pops = S.pops.filter((p) => p.life > 0);

      draw(now);
      raf = requestAnimationFrame(frame);
    }

    // ---------- drawing ----------
    function draw(now: number) {
      const c = ctx!;
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0a0a0d");
      sky.addColorStop(0.5, "#0d0d11");
      sky.addColorStop(0.82, "#0a0a0c");
      sky.addColorStop(1, "#060607");
      c.fillStyle = sky;
      c.fillRect(0, 0, W, H);

      const haze = c.createRadialGradient(W * 0.72, H * 0.4, 8, W * 0.72, H * 0.4, H * 0.62);
      haze.addColorStop(0, "rgba(120,140,160,0.05)");
      haze.addColorStop(1, "transparent");
      c.fillStyle = haze;
      c.fillRect(0, 0, W, H);

      drawBuildings();
      drawFireEscapes();
      drawNeon();
      drawBrick();
      drawGraffiti();
      drawStreetlights();
      drawRoad();
      drawDumpsters();
      drawFence();
      if (!reduce) drawRain();

      drawTokens(now);
      drawWarehouse();

      const glow = riderGlow();
      let rx = RIDER_SX();
      const ry = S.ground + S.rider.y;
      let scale = 1;
      let alpha = 1;
      if (S.phase === "arrive") {
        const t = ease(Math.min(1, S.arrive));
        const door = w2s(S.warehouseX);
        rx = lerp(RIDER_SX(), door, t);
        scale = lerp(1, 0.4, t);
        alpha = Math.max(0, 1 - Math.max(0, S.arrive - 0.55) / 0.45);
      }
      drawBike(rx, ry, now, glow, scale, alpha);

      drawPops();
      drawProgress();
      drawVignette();
    }

    function drawBuildings() {
      const c = ctx!;
      const span = W + 320;
      c.fillStyle = "#0e0e12";
      for (const b of S.buildings) {
        const x = loopX(b.x, 0.16, span) - 160;
        c.fillRect(x, H * 0.55 - b.h, b.w, b.h);
      }
      for (const w of S.windows) {
        const x = loopX(w.x, 0.06, W + 240) - 120;
        c.fillStyle = w.on ? `rgba(205,210,216,${0.1 * S.flick})` : "rgba(38,40,46,0.5)";
        c.fillRect(x, w.y, w.w, w.h);
      }
    }

    function drawFireEscapes() {
      const c = ctx!;
      c.strokeStyle = "#15151a";
      c.lineWidth = 2;
      for (const ex of S.escapes) {
        const x = loopX(ex, 0.3, W + 300) - 150;
        const top = H * 0.22;
        for (let f = 0; f < 4; f++) {
          const y = top + f * 46;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + 54, y);
          c.lineTo(x + 54, y + 46);
          c.moveTo(x, y);
          c.lineTo(x, y + 46);
          c.moveTo(x + 6, y);
          c.lineTo(x + 48, y + 46);
          c.stroke();
        }
      }
    }

    function drawNeon() {
      const c = ctx!;
      const x = loopX(W * 0.2, 0.12, W + 520) - 260;
      const y = H * 0.3;
      const f = Math.random() < 0.06 ? 0.25 : S.flick;
      c.strokeStyle = `rgba(170,180,190,${0.5 * f})`;
      c.lineWidth = 2;
      c.strokeRect(x, y, 16, 86);
      c.fillStyle = `rgba(210,220,228,${0.42 * f})`;
      for (let i = 0; i < 4; i++) c.fillRect(x + 4, y + 10 + i * 18, 8, 8);
      const g = c.createRadialGradient(x + 8, y + 43, 2, x + 8, y + 43, 70);
      g.addColorStop(0, `rgba(180,195,205,${0.16 * f})`);
      g.addColorStop(1, "transparent");
      c.fillStyle = g;
      c.fillRect(x - 60, y - 30, 140, 160);
    }

    function drawBrick() {
      const c = ctx!;
      c.strokeStyle = "rgba(30,30,36,0.6)";
      c.lineWidth = 1;
      const off = (S.scroll * 0.5) % 26;
      for (let y = S.ground - 120; y < S.ground; y += 13) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(W, y);
        c.stroke();
      }
      for (let x = -off; x < W; x += 26) {
        c.beginPath();
        c.moveTo(x, S.ground - 120);
        c.lineTo(x, S.ground);
        c.stroke();
      }
    }

    function drawGraffiti() {
      const c = ctx!;
      for (const g of S.graffiti) {
        const x = loopX(g.x, 0.5, W + 300) - 150;
        c.strokeStyle = "rgba(120,122,130,0.22)";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(x - g.r, g.y);
        c.quadraticCurveTo(x, g.y - g.r, x + g.r, g.y);
        c.quadraticCurveTo(x, g.y + g.r * 0.6, x - g.r, g.y);
        c.stroke();
      }
    }

    function drawStreetlights() {
      const c = ctx!;
      for (const lx of S.lights) {
        const sx = w2s(lx);
        if (sx < -120 || sx > W + 120) continue;
        c.strokeStyle = "#101014";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(sx + 40, 0);
        c.lineTo(sx + 40, H * 0.2);
        c.lineTo(sx, H * 0.2);
        c.stroke();
        const cone = c.createLinearGradient(sx, H * 0.2, sx, S.ground);
        cone.addColorStop(0, `rgba(200,205,210,${0.1 * S.flick})`);
        cone.addColorStop(1, "transparent");
        c.fillStyle = cone;
        c.beginPath();
        c.moveTo(sx - 6, H * 0.2);
        c.lineTo(sx + 6, H * 0.2);
        c.lineTo(sx + 70, S.ground);
        c.lineTo(sx - 70, S.ground);
        c.closePath();
        c.fill();
        const pool = c.createRadialGradient(sx, S.ground, 4, sx, S.ground, 90);
        pool.addColorStop(0, `rgba(190,196,204,${0.12 * S.flick})`);
        pool.addColorStop(1, "transparent");
        c.fillStyle = pool;
        c.beginPath();
        c.ellipse(sx, S.ground + 6, 90, 16, 0, 0, Math.PI * 2);
        c.fill();
      }
    }

    function drawRoad() {
      const c = ctx!;
      const a = c.createLinearGradient(0, S.ground, 0, H);
      a.addColorStop(0, "#0c0c0f");
      a.addColorStop(1, "#070709");
      c.fillStyle = a;
      c.fillRect(0, S.ground, W, H - S.ground);
      c.strokeStyle = "#23242a";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, S.ground);
      c.lineTo(W, S.ground);
      c.stroke();
      for (const lx of S.lights) {
        const sx = w2s(lx);
        if (sx < -40 || sx > W + 40) continue;
        const g = c.createLinearGradient(sx, S.ground, sx, H);
        g.addColorStop(0, `rgba(180,190,200,${0.06 * S.flick})`);
        g.addColorStop(1, "transparent");
        c.fillStyle = g;
        c.fillRect(sx - 8, S.ground, 16, H - S.ground);
      }
      c.fillStyle = "rgba(120,124,130,0.4)";
      const off = (S.scroll * 0.9) % 70;
      for (let x = -off; x < W; x += 70) c.fillRect(x, S.ground + 30, 26, 3);
    }

    function drawDumpsters() {
      const c = ctx!;
      for (const dx of S.dumpsters) {
        const x = w2s(dx);
        if (x < -120 || x > W + 120) continue;
        const w = 90;
        const h = 46;
        const y = S.ground - h;
        c.fillStyle = "#0c0c0f";
        c.fillRect(x, y, w, h);
        c.strokeStyle = "#1c1c22";
        c.lineWidth = 2;
        c.strokeRect(x, y, w, h);
        c.fillStyle = "#101015";
        c.fillRect(x - 4, y - 6, w + 8, 8);
        c.fillStyle = "#0a0a0d";
        c.beginPath();
        c.ellipse(x + w + 16, S.ground - 8, 14, 12, 0, 0, Math.PI * 2);
        c.ellipse(x + w + 34, S.ground - 6, 11, 10, 0, 0, Math.PI * 2);
        c.fill();
      }
    }

    function drawFence() {
      const c = ctx!;
      c.strokeStyle = "rgba(60,62,70,0.25)";
      c.lineWidth = 1;
      const off = (S.scroll * 0.7) % 18;
      const top = S.ground - 70;
      for (let x = -off; x < W; x += 18) {
        c.beginPath();
        c.moveTo(x, top);
        c.lineTo(x + 18, top + 18);
        c.moveTo(x + 18, top);
        c.lineTo(x, top + 18);
        c.stroke();
      }
    }

    function drawRain() {
      const c = ctx!;
      c.strokeStyle = "rgba(170,178,188,0.18)";
      c.lineWidth = 1;
      for (const d of S.rain) {
        d.y += d.sp * 14;
        d.x -= d.sp * 3;
        if (d.y > H) {
          d.y = -10;
          d.x = Math.random() * W;
        }
        c.beginPath();
        c.moveTo(d.x, d.y);
        c.lineTo(d.x - 2, d.y + d.len);
        c.stroke();
      }
    }

    function riderGlow(): number {
      let g = 0;
      for (const lx of S.lights) g = Math.max(g, 1 - Math.abs(S.dist - lx) / 200);
      return Math.max(0, Math.min(1, g));
    }

    function drawTokens(now: number) {
      const c = ctx!;
      for (const tk of S.tokens) {
        const sx = w2s(tk.x);
        if (sx < -40 || sx > W + 40) continue;
        const ty = tokenY(tk) + Math.sin(now / 300 + tk.x) * 6;
        c.save();
        c.translate(sx, ty);
        c.strokeStyle = "rgba(231,231,236,0.85)";
        c.lineWidth = 2;
        c.strokeRect(-22, -14, 44, 28);
        const g = c.createRadialGradient(0, 0, 2, 0, 0, 30);
        g.addColorStop(0, "rgba(220,224,228,0.14)");
        g.addColorStop(1, "transparent");
        c.fillStyle = g;
        c.fillRect(-30, -22, 60, 44);
        c.fillStyle = "#e9e9ec";
        c.font = '700 13px "Space Mono", monospace';
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(tk.v.slice(0, 3), 0, 1);
        c.restore();
      }
    }

    function drawWarehouse() {
      if (!S.unlocked) return;
      const c = ctx!;
      const doorX = w2s(S.warehouseX);
      if (doorX > W + 200) return;
      const wallLeft = doorX - 150;
      c.fillStyle = "#0b0b0e";
      c.fillRect(wallLeft, 0, W - wallLeft + 220, S.ground);
      c.strokeStyle = "rgba(40,40,48,0.6)";
      c.lineWidth = 1;
      for (let x = wallLeft; x < W + 220; x += 12) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, S.ground);
        c.stroke();
      }
      const dw = 120;
      const dh = H * 0.34;
      const dx = doorX - dw / 2;
      const dy = S.ground - dh;
      c.fillStyle = "#050506";
      c.fillRect(dx, dy, dw, dh);
      const inner = c.createLinearGradient(dx, dy, dx, S.ground);
      inner.addColorStop(0, "rgba(150,156,164,0.10)");
      inner.addColorStop(1, "rgba(120,126,134,0.02)");
      c.fillStyle = inner;
      c.fillRect(dx, dy, dw, dh);
      c.fillStyle = "#101014";
      c.fillRect(dx - 6, dy - 26, dw + 12, 24);
      c.strokeStyle = "rgba(60,62,70,0.7)";
      for (let i = 0; i < 5; i++) {
        const yy = dy - 24 + i * 5;
        c.beginPath();
        c.moveTo(dx - 6, yy);
        c.lineTo(dx + dw + 6, yy);
        c.stroke();
      }
      const lampX = doorX;
      const lampY = dy - 44;
      c.fillStyle = `rgba(210,216,222,${0.5 * S.flick})`;
      c.beginPath();
      c.arc(lampX, lampY, 5, 0, Math.PI * 2);
      c.fill();
      const cone = c.createRadialGradient(lampX, lampY, 3, lampX, lampY, 110);
      cone.addColorStop(0, `rgba(200,206,214,${0.14 * S.flick})`);
      cone.addColorStop(1, "transparent");
      c.fillStyle = cone;
      c.beginPath();
      c.moveTo(lampX - 8, lampY);
      c.lineTo(lampX + 8, lampY);
      c.lineTo(lampX + 90, S.ground);
      c.lineTo(lampX - 90, S.ground);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(150,152,160,0.55)";
      c.font = '700 12px "Space Mono", monospace';
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      c.fillText("BAY 07  //  KILLSCOMFORT", doorX, dy - 56);
      c.fillStyle = "rgba(200,204,210,0.6)";
      c.fillText("✦", doorX, dy + dh * 0.4);
    }

    function seg(c: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }) {
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.stroke();
    }

    function wheel(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot: number, glow: number) {
      // tire (dark metallic)
      c.lineWidth = r * 0.16;
      c.strokeStyle = "#34373c";
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.stroke();
      // deep-dish chrome rim
      const ro2 = r * 0.86;
      const ri = r * 0.46;
      c.save();
      c.beginPath();
      c.arc(cx, cy, ro2, 0, Math.PI * 2);
      c.arc(cx, cy, ri, 0, Math.PI * 2, true);
      const g = c.createLinearGradient(cx, cy - ro2, cx, cy + ro2);
      const hi = 0.82 + glow * 0.18;
      g.addColorStop(0, `rgba(244,247,249,${hi})`);
      g.addColorStop(0.48, "rgba(176,181,187,0.92)");
      g.addColorStop(0.52, "rgba(96,100,106,0.96)");
      g.addColorStop(1, "rgba(48,51,55,1)");
      c.fillStyle = g;
      c.fill("evenodd");
      c.restore();
      c.strokeStyle = `rgba(220,225,230,${0.6 + glow * 0.4})`;
      c.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const a = rot + (i * Math.PI * 2) / 5;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
        c.lineTo(cx + Math.cos(a) * ro2, cy + Math.sin(a) * ro2);
        c.stroke();
      }
      c.fillStyle = `rgba(235,238,242,${0.8 + glow * 0.2})`;
      c.beginPath();
      c.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
      c.fill();
      const sa = rot * 0.6;
      c.strokeStyle = `rgba(255,255,255,${0.5 + glow * 0.5})`;
      c.lineWidth = r * 0.18;
      c.beginPath();
      c.arc(cx, cy, r * 0.66, sa, sa + 0.7);
      c.stroke();
    }

    // Silver-Surfer rider: liquid-chrome frame + body with a bright sheen pass
    function drawBike(x: number, gy: number, now: number, glow: number, scale: number, alpha: number) {
      const c = ctx!;
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, gy);
      c.scale(scale, scale);
      const r = 20;
      const wb = r * 3.0;
      const rot = now / 55;
      const rearX = -wb / 2;
      const frontX = wb / 2;
      const wy = -r;

      wheel(c, rearX, wy, r, rot, glow);
      wheel(c, frontX, wy, r, rot, glow);

      const bb = { x: 0, y: -r * 0.55 };
      const seat = { x: -r * 0.45, y: -r * 1.95 };
      const head = { x: frontX - r * 0.5, y: -r * 1.75 };
      const bars = { x: frontX - r * 0.15, y: -r * 1.78 };

      // vertical chrome gradient shared by frame + body
      const chrome = c.createLinearGradient(0, -r * 2.4, 0, 2);
      chrome.addColorStop(0, "#ffffff");
      chrome.addColorStop(0.4, "#dfe3e7");
      chrome.addColorStop(0.62, "#aab0b7");
      chrome.addColorStop(1, "#6c7178");

      c.lineCap = "round";
      c.lineJoin = "round";
      c.strokeStyle = chrome;
      c.lineWidth = 3.4;
      seg(c, bb, { x: rearX, y: wy });
      seg(c, bb, seat);
      seg(c, seat, { x: rearX, y: wy });
      seg(c, bb, head);
      seg(c, seat, head);
      seg(c, head, { x: frontX, y: wy });
      c.beginPath();
      c.moveTo(bars.x, bars.y);
      c.lineTo(bars.x + 8, bars.y - 2);
      c.lineTo(bars.x + 12, bars.y - 9);
      c.stroke();
      c.beginPath();
      c.moveTo(seat.x - 7, seat.y);
      c.lineTo(seat.x + 6, seat.y);
      c.stroke();

      c.fillStyle = "#cfd3d8";
      c.beginPath();
      c.arc(bb.x, bb.y, 4.5, 0, Math.PI * 2);
      c.fill();

      const crankR = 7;
      const pedal = { x: bb.x + Math.cos(rot) * crankR, y: bb.y + Math.sin(rot) * crankR };
      const hip = { x: seat.x + 2, y: seat.y + 2 };
      c.strokeStyle = chrome;
      c.lineWidth = 3.4;
      const knee = { x: (hip.x + pedal.x) / 2 + 6, y: (hip.y + pedal.y) / 2 + 2 };
      seg(c, hip, knee);
      seg(c, knee, pedal);

      c.lineWidth = 4.2;
      const shoulder = { x: seat.x + (head.x - seat.x) * 0.42, y: seat.y - 9 };
      seg(c, hip, shoulder);
      seg(c, shoulder, { x: bars.x, y: bars.y });

      // chrome head sphere
      const headC = { x: shoulder.x + 6, y: shoulder.y - 9 };
      const hg = c.createRadialGradient(headC.x - 2, headC.y - 3, 1, headC.x, headC.y, 7);
      hg.addColorStop(0, "#ffffff");
      hg.addColorStop(0.5, "#cfd3d8");
      hg.addColorStop(1, "#7d828a");
      c.fillStyle = hg;
      c.beginPath();
      c.arc(headC.x, headC.y, 5.6, 0, Math.PI * 2);
      c.fill();

      // bright sheen pass along the top edges
      c.strokeStyle = `rgba(255,255,255,${0.55 + glow * 0.4})`;
      c.lineWidth = 1.1;
      seg(c, { x: hip.x, y: hip.y - 1 }, { x: shoulder.x, y: shoulder.y - 1 });
      seg(c, seat, { x: head.x, y: head.y });
      // specular dot on the head
      c.fillStyle = `rgba(255,255,255,${0.7 + glow * 0.3})`;
      c.beginPath();
      c.arc(headC.x - 2, headC.y - 2, 1.4, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    function drawPops() {
      const c = ctx!;
      for (const p of S.pops) {
        c.save();
        c.globalAlpha = Math.max(0, p.life);
        c.fillStyle = "#e9e9ec";
        c.font = '700 18px "Archivo Narrow","Arial Narrow",Impact,sans-serif';
        c.textAlign = "center";
        c.fillText(p.text, p.x, p.y - (1 - p.life) * 44);
        c.restore();
      }
    }

    function drawProgress() {
      const c = ctx!;
      const pw = W - 44;
      let frac: number;
      let label: string;
      if (!S.unlocked) {
        const got = 3 - S.tokens.length;
        frac = got / 3;
        label = "// tags: " + got + "/3";
      } else {
        frac = Math.min(1, (S.dist - S.runwayStart) / Math.max(1, S.warehouseX - S.runwayStart));
        label = "// to_the_warehouse";
      }
      c.fillStyle = "#1a1a1e";
      c.fillRect(22, 18, pw, 3);
      c.fillStyle = "#c7cace";
      c.fillRect(22, 18, pw * frac, 3);
      c.fillStyle = "#6f6f78";
      c.font = '10px "Space Mono", monospace';
      c.textAlign = "left";
      c.textBaseline = "alphabetic";
      c.fillText(label, 22, 40);
    }

    function drawVignette() {
      const c = ctx!;
      const v = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
      const dark = S.phase === "arrive" ? 0.4 + ease(S.arrive) * 0.6 : 0.4;
      v.addColorStop(0, "transparent");
      v.addColorStop(1, `rgba(0,0,0,${dark})`);
      c.fillStyle = v;
      c.fillRect(0, 0, W, H);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`${styles.ride}`} style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={hintRef} className={styles.ridehint}>
        TAP / SPACE TO HOP · GRAB ALL 3 TAGS
      </div>
    </div>
  );
}
