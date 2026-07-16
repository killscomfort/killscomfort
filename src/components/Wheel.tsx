'use client';
// ============================================================
// THE CHROMATIC WHEEL — the course's signature element.
// Circle of fifths as a 12-hue color wheel. Outer ring = major
// keys, inner ring = relative minors (same hue, darker shade).
// Tap a segment → hear its triad. Optional geometry overlays
// (dodecagram, inscribed polygons) + progress lighting.
// ============================================================
import { useMemo, useState } from 'react';
import { KEYS, keyColor, minorColor, triadFreqs } from '../lib/theory';
import { playTriad } from '../lib/audio';

type Props = {
  size?: number;
  focusKeys?: string[];        // highlighted segments
  litKeys?: string[];          // progress: fully lit segments
  overlay?: 'dodecagram' | 'triangle' | 'square' | 'hexagon' | 'diameter' | null;
  interactive?: boolean;
  locked?: boolean; // signup-gated: taps route to /academy/auth instead of playing
};

const TAU = Math.PI * 2;
const pt = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

function segPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = pt(cx, cy, r1, a0), [x1, y1] = pt(cx, cy, r1, a1);
  const [x2, y2] = pt(cx, cy, r0, a1), [x3, y3] = pt(cx, cy, r0, a0);
  return `M${x0},${y0} A${r1},${r1} 0 0 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 0 ${x3},${y3} Z`;
}

export default function Wheel({ size = 340, focusKeys = [], litKeys = [], overlay = null, interactive = true, locked = false }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const c = size / 2;
  const rOuter = c - 4, rMid = c * 0.66, rInner = c * 0.42;
  const seg = TAU / 12;
  const start = -Math.PI / 2 - seg / 2; // C centered at 12 o'clock

  const focus = new Set(focusKeys);
  const lit = new Set(litKeys);
  const anyFocus = focus.size > 0;

  const overlayPts = useMemo(() => {
    const at = (i: number) => pt(c, c, rInner - 8, -Math.PI / 2 + i * seg);
    switch (overlay) {
      case 'dodecagram': return Array.from({ length: 13 }, (_, k) => at((k * 7) % 12)); // path of fifths through chromatic order ≡ star
      case 'triangle':   return [at(0), at(4), at(8), at(0)];
      case 'square':     return [at(0), at(3), at(6), at(9), at(0)];
      case 'hexagon':    return [at(0), at(2), at(4), at(6), at(8), at(10), at(0)];
      case 'diameter':   return [at(0), at(6)];
      default: return null;
    }
  }, [overlay, c, rInner, seg]);

  const play = (name: string, freq: number, quality: 'maj' | 'min') => {
    if (locked) { window.location.href = '/academy/auth'; return; }
    if (!interactive) return;
    setActive(name);
    playTriad(triadFreqs(quality === 'min' ? freq * 0.84 : freq, quality));
    setTimeout(() => setActive(null), 500);
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label="Circle of fifths color wheel">
      {KEYS.map((k, i) => {
        const a0 = start + i * seg, a1 = a0 + seg;
        const isFocus = focus.has(k.name) || focus.has(k.minor);
        const isLit = lit.has(k.name);
        const dim = anyFocus && !isFocus;
        const glow = active === k.name || active === k.minor;
        const [lx, ly] = pt(c, c, (rOuter + rMid) / 2, a0 + seg / 2);
        const [mx, my] = pt(c, c, (rMid + rInner) / 2, a0 + seg / 2);
        return (
          <g key={k.name} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            {/* outer: major */}
            <path
              d={segPath(c, c, rMid, rOuter, a0 + 0.012, a1 - 0.012)}
              fill={keyColor(k.hue, isLit || isFocus ? 88 : 62, dim ? 22 : isLit ? 60 : 46)}
              opacity={dim ? 0.35 : 1}
              style={{ transition: 'all .25s', filter: glow ? `drop-shadow(0 0 10px ${keyColor(k.hue)})` : undefined }}
              onClick={() => play(k.name, k.freq, 'maj')}
            />
            {/* inner: relative minor — same hue, darker shade */}
            <path
              d={segPath(c, c, rInner, rMid, a0 + 0.014, a1 - 0.014)}
              fill={minorColor(k.hue)}
              opacity={dim ? 0.25 : isLit || isFocus ? 1 : 0.75}
              style={{ transition: 'all .25s' }}
              onClick={() => play(k.minor, k.freq, 'min')}
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.042} fontFamily="var(--kc-mono)" fontWeight={700}
              fill="#0A0A0B" opacity={dim ? 0.4 : 0.9} pointerEvents="none">{k.name}</text>
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.03} fontFamily="var(--kc-mono)"
              fill="#EDEBE6" opacity={dim ? 0.3 : 0.75} pointerEvents="none">{k.minor}</text>
          </g>
        );
      })}
      {/* hub */}
      <circle cx={c} cy={c} r={rInner - 2} fill="#0A0A0B" stroke="#232327" />
      <text x={c} y={c - 6} textAnchor="middle" fontSize={size * 0.032} fontFamily="var(--kc-mono)" fill="#7C7A75">✦</text>
      <text x={c} y={c + 12} textAnchor="middle" fontSize={size * 0.026} fontFamily="var(--kc-mono)" fill="#7C7A75" letterSpacing="1.5">
        {locked ? 'SIGN UP TO PLAY' : interactive ? 'TAP TO HEAR' : 'THE WHEEL'}
      </text>
      {/* sacred geometry overlay */}
      {overlayPts && (
        <polyline
          points={overlayPts.map((p) => p.join(',')).join(' ')}
          fill="none" stroke="#EDEBE6" strokeWidth={1.1} opacity={0.85}
          strokeLinejoin="round" style={{ mixBlendMode: 'screen' }}
        />
      )}
    </svg>
  );
}
