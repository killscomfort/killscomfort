export type TrafficRange = "today" | "yesterday" | "7d" | "30d" | "all";

const TZ = "America/New_York";

function etDateString(daysAgo = 0): string {
  const date = new Date();
  if (daysAgo) date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

function etOffsetForDate(dateYmd: string): string {
  const probe = new Date(`${dateYmd}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    timeZoneName: "shortOffset",
  }).formatToParts(probe);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const match = offset.match(/GMT([+-]\d+(?::\d+)?)/);
  if (!match) return "-05:00";
  const raw = match[1];
  if (raw.includes(":")) return raw;
  const sign = raw.startsWith("-") ? "-" : "+";
  const hours = Math.abs(Number(raw)).toString().padStart(2, "0");
  return `${sign}${hours}:00`;
}

function etBoundaryIso(dateYmd: string, end = false): string {
  const offset = etOffsetForDate(dateYmd);
  const time = end ? "23:59:59.999" : "00:00:00.000";
  return `${dateYmd}T${time}${offset}`;
}

export function getTrafficRangeBounds(range: TrafficRange): {
  from: string | null;
  to: string | null;
} {
  if (range === "all") return { from: null, to: null };

  if (range === "today") {
    const day = etDateString(0);
    return { from: etBoundaryIso(day), to: etBoundaryIso(day, true) };
  }

  if (range === "yesterday") {
    const day = etDateString(1);
    return { from: etBoundaryIso(day), to: etBoundaryIso(day, true) };
  }

  if (range === "7d") {
    return { from: etBoundaryIso(etDateString(6)), to: null };
  }

  if (range === "30d") {
    return { from: etBoundaryIso(etDateString(29)), to: null };
  }

  return { from: null, to: null };
}

export function getChartRangeBounds(): { from: string; to: string } {
  const from = etBoundaryIso(etDateString(29));
  const to = etBoundaryIso(etDateString(0), true);
  return { from, to };
}

export const TRAFFIC_RANGE_OPTIONS: { value: TrafficRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];
