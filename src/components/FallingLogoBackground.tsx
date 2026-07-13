"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isImmersiveLandPath, isRidePath } from "@/lib/ride-games";

const LOGO_SRC = "/logo-chrome.png";
const LOGO_COUNT = 40;
const WHOIS_RING_BIAS = 0.65;
const WHOIS_RING_MARGIN = 24;
const BASE_OPACITY = { min: 0.12, max: 0.32 };
const SIZE = { min: 100, max: 260 };
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

type WhoIsRing = {
  left: DOMRect;
  right: DOMRect;
  top: DOMRect;
  bottom: DOMRect;
};

function getWhoIsRing(): WhoIsRing | null {
  const section = document.getElementById("whois");
  const image = section?.querySelector("[data-whois-image]");
  if (!section || !image) return null;

  const sectionRect = section.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();

  if (
    sectionRect.bottom < 0 ||
    sectionRect.top > window.innerHeight ||
    imageRect.width < 1 ||
    imageRect.height < 1
  ) {
    return null;
  }

  const pad = WHOIS_RING_MARGIN;

  return {
    left: new DOMRect(
      sectionRect.left,
      sectionRect.top,
      Math.max(0, imageRect.left - sectionRect.left - pad),
      sectionRect.height
    ),
    right: new DOMRect(
      imageRect.right + pad,
      sectionRect.top,
      Math.max(0, sectionRect.right - imageRect.right - pad),
      sectionRect.height
    ),
    top: new DOMRect(
      imageRect.left,
      sectionRect.top,
      imageRect.width,
      Math.max(0, imageRect.top - sectionRect.top - pad)
    ),
    bottom: new DOMRect(
      imageRect.left,
      imageRect.bottom + pad,
      imageRect.width,
      Math.max(0, sectionRect.bottom - imageRect.bottom - pad)
    ),
  };
}

function pickRingZone(ring: WhoIsRing): DOMRect | null {
  const zones = [ring.left, ring.right, ring.top, ring.bottom].filter(
    (zone) => zone.width > 48 && zone.height > 48
  );
  if (zones.length === 0) return null;
  return zones[Math.floor(Math.random() * zones.length)];
}

function pointInRing(ring: WhoIsRing): { x: number; y: number } | null {
  const zone = pickRingZone(ring);
  if (!zone) return null;
  return {
    x: rand(zone.left + zone.width * 0.08, zone.left + zone.width * 0.92),
    y: rand(zone.top + zone.height * 0.08, zone.top + zone.height * 0.92),
  };
}

function isInWhoIsFlank(ring: WhoIsRing, p: Particle): boolean {
  const zones = [ring.left, ring.right, ring.top, ring.bottom];
  return zones.some(
    (zone) =>
      zone.width > 48 &&
      zone.height > 48 &&
      p.x >= zone.left &&
      p.x <= zone.left + zone.width &&
      p.y >= zone.top &&
      p.y <= zone.top + zone.height
  );
}

function makeParticle(
  canvasW: number,
  canvasH: number,
  spreadY: boolean | "top" | "bottom" = true,
  ring?: WhoIsRing | null
): Particle {
  let x = rand(0, canvasW);
  let y: number;

  if (spreadY === true) y = rand(-canvasH, canvasH);
  else if (spreadY === "bottom") y = rand(canvasH + 40, canvasH + 200);
  else y = rand(-200, -40);

  if (ring && Math.random() < WHOIS_RING_BIAS) {
    const point = pointInRing(ring);
    if (point) {
      x = point.x;
      y = point.y;
    }
  }

  return {
    x,
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
      makeParticle(canvas.width, canvas.height, true, getWhoIsRing())
    );
    let whoisSeeded = false;

    function seedWhoisRing() {
      const ring = getWhoIsRing();
      if (!ring) return;
      for (let i = 0; i < 14; i++) {
        const idx = Math.floor(Math.random() * particles.length);
        particles[idx] = makeParticle(
          canvas!.width,
          canvas!.height,
          true,
          ring
        );
        const point = pointInRing(ring);
        if (point) {
          particles[idx].x = point.x;
          particles[idx].y = point.y;
        }
      }
    }

    function onResizeParticles() {
      particles = Array.from({ length: LOGO_COUNT }, () =>
        makeParticle(canvas!.width, canvas!.height, true, getWhoIsRing())
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

      const ring = getWhoIsRing();
      if (ring && !whoisSeeded) {
        whoisSeeded = true;
        seedWhoisRing();
      } else if (!ring) {
        whoisSeeded = false;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    if (getWhoIsRing()) {
      whoisSeeded = true;
      seedWhoisRing();
    }

    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      scrollVelRef.current *= SCROLL_DECAY;
      if (Math.abs(scrollVelRef.current) < 0.01) scrollVelRef.current = 0;

      // Positive = fall down; negative scroll velocity reverses upward
      const speedMul = 1 + scrollVelRef.current;
      const rotMul = Math.max(1, Math.abs(speedMul));

      const whoisRing = getWhoIsRing();

      for (const p of particles) {
        if (!reducedMotion.current) {
          p.y += p.speed * speedMul;
          p.x += p.drift;
          p.rotation += p.rotSpeed * rotMul;
        } else {
          p.y += p.speed * 0.3;
        }

        if (p.y > canvas.height + p.size) {
          Object.assign(p, makeParticle(canvas.width, canvas.height, "top", whoisRing));
        } else if (p.y < -p.size) {
          Object.assign(p, makeParticle(canvas.width, canvas.height, "bottom", whoisRing));
        }

        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;

        if (!imgReady) continue;

        const aspectRatio = 800 / 533;
        const drawW = p.size * aspectRatio;
        const drawH = p.size;
        const drawOpacity =
          whoisRing && isInWhoIsFlank(whoisRing, p) ? Math.min(0.42, p.opacity + 0.08) : p.opacity;

        ctx.save();
        ctx.globalAlpha = drawOpacity;
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
