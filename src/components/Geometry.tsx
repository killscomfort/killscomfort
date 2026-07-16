'use client';
import React from 'react';
// ============================================================
// SACRED GEOMETRY — precision SVG figures used as lesson
// imagery. Line-art on near-black, drawn (not stock) so every
// figure is mathematically exact and matches the site chrome.
// ============================================================
import { keyColor } from '../lib/theory';

const S = 300, C = S / 2;
const stroke = { fill: 'none', strokeWidth: 1.1, opacity: 0.9 } as const;

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure className="kc-geo">
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label={label}>
        <rect width={S} height={S} fill="none" />
        {children}
      </svg>
      <figcaption>{`fig // ${label}`}</figcaption>
    </figure>
  );
}

// Two equal overlapping circles — two tones, shared consonance.
export function Vesica({ hueA = 0, hueB = 30 }: { hueA?: number; hueB?: number }) {
  const r = 78, d = r; // centers r apart = classic vesica
  return (
    <Frame label="VESICA PISCIS — TWO TONES, ONE SHARED SPACE">
      <circle cx={C - d / 2} cy={C} r={r} stroke={keyColor(hueA)} {...stroke} />
      <circle cx={C + d / 2} cy={C} r={r} stroke={keyColor(hueB)} {...stroke} />
      <ellipse cx={C} cy={C} rx={r * 0.5} ry={r * 0.865} stroke="#EDEBE6" {...stroke} opacity={0.35} />
    </Frame>
  );
}

// 19-circle flower of life, hue-rotated per ring.
export function FlowerOfLife() {
  const r = 38;
  const pts: [number, number, number][] = [[C, C, 0]];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push([C + r * Math.cos(a), C + r * Math.sin(a), i * 60]);                     // ring 1
    pts.push([C + 2 * r * Math.cos(a), C + 2 * r * Math.sin(a), i * 60 + 30]);       // ring 2 outer
    const b = a + Math.PI / 6;
    pts.push([C + r * Math.sqrt(3) * Math.cos(b), C + r * Math.sqrt(3) * Math.sin(b), i * 60 + 15]); // ring 2 mid
  }
  return (
    <Frame label="FLOWER OF LIFE — ONE RATIO, REPEATED">
      {pts.map(([x, y, h], i) => (
        <circle key={i} cx={x} cy={y} r={r} stroke={keyColor(h, 70, 50)} {...stroke} opacity={0.55} />
      ))}
    </Frame>
  );
}

// Golden-ratio rectangle + quarter-circle spiral.
export function PhiSpiral() {
  const phi = 1.618;
  let w = 200, h = w / phi, x = (S - w) / 2, y = (S - h) / 2;
  const rects: React.ReactElement[] = [];
  const arcs: string[] = [];
  let dir = 0;
  for (let i = 0; i < 7; i++) {
    rects.push(<rect key={i} x={x} y={y} width={w} height={h} stroke="#3A3A40" fill="none" strokeWidth={0.8} />);
    const s = Math.min(w, h);
    if (dir === 0) { arcs.push(`M${x},${y + h} A${s},${s} 0 0 1 ${x + s},${y + h - s}`); x += s; w -= s; }
    else if (dir === 1) { arcs.push(`M${x},${y} A${s},${s} 0 0 1 ${x + w - 0},${y + s}` ); y += s; h -= s; }
    else if (dir === 2) { arcs.push(`M${x + w},${y} A${s},${s} 0 0 1 ${x + w - s},${y + s}`); w -= s; }
    else { arcs.push(`M${x + w},${y + h} A${s},${s} 0 0 1 ${x + w - s},${y + h - s}`); h -= s; }
    dir = (dir + 1) % 4;
  }
  return (
    <Frame label="φ — THE GOLDEN SECTION (CLIMAX ≈ 62%)">
      {rects}
      <path d={arcs.join(' ')} stroke={keyColor(30)} {...stroke} strokeWidth={1.4} />
      <line x1={S * 0.62} y1={30} x2={S * 0.62} y2={S - 30} stroke={keyColor(0)} strokeDasharray="3 5" strokeWidth={1} opacity={0.7} />
      <text x={S * 0.62 + 6} y={40} fontSize={9} fontFamily="var(--kc-mono)" fill={keyColor(0)}>0.618</text>
    </Frame>
  );
}

// Chladni-style nodal figure (stylized): radial + ring nodes.
export function Chladni() {
  const rings = [30, 55, 80, 105];
  const spokes = 12;
  return (
    <Frame label="CHLADNI FIGURE — VIBRATION ARRANGES MATTER">
      {rings.map((r, i) => (
        <circle key={r} cx={C} cy={C} r={r} stroke={keyColor(i * 90, 70, 55)} {...stroke} opacity={0.7}
          strokeDasharray={i % 2 ? '2 6' : undefined} />
      ))}
      {Array.from({ length: spokes }, (_, i) => {
        const a = (Math.PI / 6) * i;
        return (
          <line key={i}
            x1={C + 20 * Math.cos(a)} y1={C + 20 * Math.sin(a)}
            x2={C + 112 * Math.cos(a)} y2={C + 112 * Math.sin(a)}
            stroke="#EDEBE6" strokeWidth={0.6} opacity={0.28} strokeDasharray="1 7" />
        );
      })}
      <circle cx={C} cy={C} r={3} fill={keyColor(0)} />
    </Frame>
  );
}

// Router used by lesson pages.
export function GeometryFigure({ kind }: { kind?: string }) {
  switch (kind) {
    case 'vesica': return <Vesica />;
    case 'flower': return <FlowerOfLife />;
    case 'phi': return <PhiSpiral />;
    case 'chladni': return <Chladni />;
    default: return null; // dodecagram/triangle/square/hexagon/diameter render as Wheel overlays
  }
}
