"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isImmersiveLandPath, isRidePath } from "@/lib/ride-games";

const LOGO_SRC = "/logo-chrome.png";
const LOGO_COUNT = 16;
const BASE_OPACITY = { min: 0.1, max: 0.28 };
const SIZE = { min: 110, max: 240 };
const FALL_SPEED = { min: 0.28, max: 0.72 };
const DRIFT_RANGE = 0.15;
const ROT_SPEED = 0.006;
const SCROLL_BOOST = 0.12;
const SCROLL_DECAY = 0.9;
const SCROLL_VEL_MAX = 4;

type Particle = {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  speed: number;
  opacity: number;
  drift: number;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeParticle(
  canvasW: number,
  canvasH: number,
  spreadY: boolean | "top" | "bottom" = true
): Particle {
  let y: number;
  if (spreadY === true) y = rand(-canvasH, canvasH);
  else if (spreadY === "bottom") y = rand(canvasH + 40, canvasH + 200);
  else y = rand(-200, -40); // "top" or false — enter from above

  return {
    x: rand(0, canvasW),
    y,
    size: rand(SIZE.min, SIZE.max),
    rotation: rand(0, Math.PI * 2),
    rotSpeed: rand(-ROT_SPEED, ROT_SPEED),
    speed: rand(FALL_SPEED.min, FALL_SPEED.max),
    opacity: rand(BASE_OPACITY.min, BASE_OPACITY.max),
    drift: rand(-DRIFT_RANGE, DRIFT_RANGE),
  };
}

export default function FallingLogoBackground() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollVelRef = useRef(0);
  const lastScrollY = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const reducedMotion = useRef(false);
  const hidden = isRidePath(pathname) || isImmersiveLandPath(pathname);

  useEffect(() => {
    if (hidden) return;

    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const img = new Image();
    img.src = LOGO_SRC;
    let imgReady = false;
    img.onload = () => {
      imgReady = true;
    };

    let particles = Array.from({ length: LOGO_COUNT }, () =>
      makeParticle(canvas.width, canvas.height, true)
    );

    function onResizeParticles() {
      particles = Array.from({ length: LOGO_COUNT }, () =>
        makeParticle(canvas!.width, canvas!.height, true)
      );
    }
    window.addEventListener("resize", onResizeParticles);

    lastScrollY.current = window.scrollY;

    function onScroll() {
      const delta = window.scrollY - lastScrollY.current;
      lastScrollY.current = window.scrollY;
      scrollVelRef.current = Math.max(
        -SCROLL_VEL_MAX,
        Math.min(SCROLL_VEL_MAX, scrollVelRef.current + delta * SCROLL_BOOST)
      );
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      scrollVelRef.current *= SCROLL_DECAY;
      if (Math.abs(scrollVelRef.current) < 0.01) scrollVelRef.current = 0;

      // Positive = fall down; negative scroll velocity reverses upward
      const speedMul = 1 + scrollVelRef.current;
      const rotMul = Math.max(1, Math.abs(speedMul));

      for (const p of particles) {
        if (!reducedMotion.current) {
          p.y += p.speed * speedMul;
          p.x += p.drift;
          p.rotation += p.rotSpeed * rotMul;
        } else {
          p.y += p.speed * 0.3;
        }

        if (p.y > canvas.height + p.size) {
          Object.assign(p, makeParticle(canvas.width, canvas.height, "top"));
        } else if (p.y < -p.size) {
          Object.assign(p, makeParticle(canvas.width, canvas.height, "bottom"));
        }

        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;

        if (!imgReady) continue;

        const aspectRatio = 800 / 533;
        const drawW = p.size * aspectRatio;
        const drawH = p.size;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", onResizeParticles);
      window.removeEventListener("scroll", onScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
