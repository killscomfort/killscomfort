"use client";

import type { TrafficChartPoint } from "@/lib/traffic/queries";

type Props = {
  data: TrafficChartPoint[];
};

export function TrafficLineChart({ data }: Props) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-bone/50">No traffic data yet.</p>
    );
  }

  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.count), 1);

  const points = data.map((d, i) => {
    const x = pad.left + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = pad.top + innerH - (d.count / max) * innerH;
    return { x, y, ...d };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${points[0]?.x ?? pad.left},${pad.top + innerH} ${line} ${points[points.length - 1]?.x ?? pad.left},${pad.top + innerH}`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[320px] w-full text-bone/50"
        role="img"
        aria-label="Traffic over the last 30 days"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = pad.top + innerH - tick * innerH;
          const value = Math.round(max * tick);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.15}
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-bone/40 text-[10px]"
              >
                {value}
              </text>
            </g>
          );
        })}

        <polygon points={area} className="fill-muted-gold/10" />
        <polyline
          points={line}
          fill="none"
          className="stroke-muted-gold"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={3}
            className="fill-muted-gold"
          />
        ))}

        {points
          .filter((_, i) => i % 5 === 0 || i === points.length - 1)
          .map((p) => (
            <text
              key={`label-${p.date}`}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-bone/45 text-[10px]"
            >
              {p.date.slice(5)}
            </text>
          ))}
      </svg>
    </div>
  );
}
