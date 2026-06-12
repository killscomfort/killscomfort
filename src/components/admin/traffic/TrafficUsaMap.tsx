"use client";

import type { TrafficMapPoint } from "@/lib/traffic/queries";

type Props = {
  points: TrafficMapPoint[];
};

function projectUS(lat: number, lon: number, width: number, height: number) {
  const x = ((lon + 125) / 59) * width;
  const y = ((50 - lat) / 26) * height;
  return { x, y };
}

export function TrafficUsaMap({ points }: Props) {
  const width = 640;
  const height = 360;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[280px] w-full"
        role="img"
        aria-label="USA traffic map"
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={8}
          className="fill-warm-charcoal stroke-clay/25"
        />

        <path
          d="M40,120 L120,80 L200,70 L280,90 L360,75 L440,95 L520,85 L600,110 L580,180 L520,220 L440,250 L360,280 L280,300 L200,290 L120,260 L60,220 Z"
          className="fill-near-black/40 stroke-clay/20"
        />

        {points.map((point) => {
          const { x, y } = projectUS(
            point.latitude,
            point.longitude,
            width,
            height
          );
          const r = Math.min(10, 4 + point.count);
          return (
            <g key={`${point.latitude}-${point.longitude}`}>
              <circle
                cx={x}
                cy={y}
                r={r}
                className="fill-muted-gold/70 stroke-near-black"
                strokeWidth={1}
              />
              <title>
                {point.city || "Unknown"}, {point.region || "US"} — {point.count}{" "}
                visit{point.count === 1 ? "" : "s"}
              </title>
            </g>
          );
        })}

        {points.length === 0 && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            className="fill-bone/40 text-sm"
          >
            No US locations in this range
          </text>
        )}
      </svg>
    </div>
  );
}
