import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExcludedIp, PageView } from "@/types/database";
import {
  getChartRangeBounds,
  getTrafficRangeBounds,
  type TrafficRange,
} from "@/lib/traffic/ranges";

export type TrafficVisitRow = PageView;

export type TrafficChartPoint = {
  date: string;
  count: number;
};

export type TrafficMapPoint = {
  latitude: number;
  longitude: number;
  city: string | null;
  neighborhood: string | null;
  region: string | null;
  count: number;
};

export type TrafficLocationStat = {
  city: string;
  neighborhood: string | null;
  region: string | null;
  count: number;
};

export type TrafficReferrerStat = {
  referrer: string;
  count: number;
  isGoogle: boolean;
  campaignId: string | null;
};

export type TrafficDashboardData = {
  visits: TrafficVisitRow[];
  total: number;
  chart: TrafficChartPoint[];
  mapPoints: TrafficMapPoint[];
  locations: TrafficLocationStat[];
  referrers: TrafficReferrerStat[];
  excludedIps: ExcludedIp[];
};

function applyRangeFilter<T>(
  query: T,
  from: string | null,
  to: string | null
): T {
  let q = query as {
    gte: (col: string, val: string) => typeof query;
    lte: (col: string, val: string) => typeof query;
  };
  if (from) q = q.gte("created_at", from) as typeof query;
  if (to) q = q.lte("created_at", to) as typeof query;
  return q as T;
}

function filterExcluded(rows: PageView[], excluded: string[]): PageView[] {
  if (!excluded.length) return rows;
  const blocked = new Set(excluded);
  return rows.filter((row) => !row.visitor_ip || !blocked.has(row.visitor_ip));
}

function applyExcludedToQuery<T>(query: T, excluded: string[]): T {
  let q = query as { neq: (col: string, val: string) => T };
  for (const ip of excluded) {
    q = q.neq("visitor_ip", ip) as T;
  }
  return q;
}

function parseReferrerLabel(referrer: string | null): string {
  if (!referrer) return "Direct / none";
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function isGoogleReferrer(referrer: string | null): boolean {
  if (!referrer) return false;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host.includes("google.");
  } catch {
    return referrer.toLowerCase().includes("google");
  }
}

function buildChartPoints(rows: { created_at: string }[]): TrafficChartPoint[] {
  const counts = new Map<string, number>();
  const { from, to } = getChartRangeBounds();
  const start = new Date(from);
  const end = new Date(to);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    counts.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

function buildMapPoints(rows: PageView[]): TrafficMapPoint[] {
  const grouped = new Map<
    string,
    TrafficMapPoint & { latSum: number; lngSum: number }
  >();

  for (const row of rows) {
    if (row.latitude == null || row.longitude == null) continue;
    if (row.country && row.country !== "US") continue;

    const key = `${row.city || "Unknown"}|${row.region || ""}|${row.neighborhood || ""}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      existing.latSum += row.latitude;
      existing.lngSum += row.longitude;
      existing.latitude = existing.latSum / existing.count;
      existing.longitude = existing.lngSum / existing.count;
      if (!existing.neighborhood && row.neighborhood) {
        existing.neighborhood = row.neighborhood;
      }
    } else {
      grouped.set(key, {
        latitude: row.latitude,
        longitude: row.longitude,
        latSum: row.latitude,
        lngSum: row.longitude,
        city: row.city,
        neighborhood: row.neighborhood,
        region: row.region,
        count: 1,
      });
    }
  }

  return Array.from(grouped.values()).map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    city: point.city,
    neighborhood: point.neighborhood,
    region: point.region,
    count: point.count,
  }));
}

function buildLocationStats(rows: PageView[]): TrafficLocationStat[] {
  const grouped = new Map<string, TrafficLocationStat>();

  for (const row of rows) {
    const city = row.city || "Unknown";
    const key = `${city}|${row.neighborhood || ""}|${row.region || ""}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, {
        city,
        neighborhood: row.neighborhood,
        region: row.region,
        count: 1,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}

function buildReferrerStats(rows: PageView[]): TrafficReferrerStat[] {
  const grouped = new Map<string, TrafficReferrerStat>();

  for (const row of rows) {
    const label = parseReferrerLabel(row.referrer);
    const google = isGoogleReferrer(row.referrer);
    const campaignId =
      row.gclid ||
      (google && row.utm_campaign ? row.utm_campaign : null) ||
      null;
    const key = `${label}|${campaignId || ""}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, {
        referrer: label,
        count: 1,
        isGoogle: google,
        campaignId,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
}

function dedupeByIp(rows: PageView[]): PageView[] {
  const seen = new Set<string>();
  const result: PageView[] = [];
  for (const row of rows) {
    const ip = row.visitor_ip || row.id;
    if (seen.has(ip)) continue;
    seen.add(ip);
    result.push(row);
  }
  return result;
}

export async function fetchTrafficDashboard(
  supabase: SupabaseClient,
  options: {
    range: TrafficRange;
    uniqueOnly: boolean;
    offset: number;
    limit: number;
  }
): Promise<TrafficDashboardData> {
  const { range, uniqueOnly, offset, limit } = options;
  const { from, to } = getTrafficRangeBounds(range);
  const chartBounds = getChartRangeBounds();

  const { data: excludedRows } = await supabase
    .from("excluded_ips")
    .select("*")
    .order("created_at", { ascending: false });

  const excludedIps = (excludedRows || []) as ExcludedIp[];
  const excluded = excludedIps.map((row) => row.ip_address);

  let listQuery = supabase
    .from("page_views")
    .select("*")
    .order("created_at", { ascending: false });

  listQuery = applyRangeFilter(listQuery, from, to);
  listQuery = applyExcludedToQuery(listQuery, excluded);

  const { data: listRows } = await listQuery;
  const allInRange = filterExcluded((listRows || []) as PageView[], excluded);
  const listSource = uniqueOnly ? dedupeByIp(allInRange) : allInRange;
  const visits = listSource.slice(offset, offset + limit);

  let chartQuery = supabase
    .from("page_views")
    .select("created_at")
    .gte("created_at", chartBounds.from)
    .lte("created_at", chartBounds.to);

  if (excluded.length) {
    chartQuery = applyExcludedToQuery(chartQuery, excluded);
  }

  const { data: chartRows } = await chartQuery;
  const chart = buildChartPoints(
    filterExcluded((chartRows || []) as PageView[], excluded)
  );

  let mapQuery = supabase
    .from("page_views")
    .select("*")
    .order("created_at", { ascending: false });

  mapQuery = applyRangeFilter(mapQuery, from, to);
  mapQuery = applyExcludedToQuery(mapQuery, excluded);

  const { data: mapRows } = await mapQuery;
  const mapSource = filterExcluded((mapRows || []) as PageView[], excluded);
  const mapPoints = buildMapPoints(mapSource);
  const locations = buildLocationStats(mapSource);
  const referrers = buildReferrerStats(mapSource);

  return {
    visits,
    total: listSource.length,
    chart,
    mapPoints,
    locations,
    referrers,
    excludedIps,
  };
}

export function formatReferrerDisplay(row: PageView): {
  label: string;
  isGoogle: boolean;
  campaignId: string | null;
} {
  const label = parseReferrerLabel(row.referrer);
  const isGoogle = isGoogleReferrer(row.referrer);
  const campaignId =
    row.gclid || (isGoogle && row.utm_campaign ? row.utm_campaign : null);
  return { label, isGoogle, campaignId };
}

export function formatVisitLocation(row: PageView): string {
  const parts = [row.city, row.neighborhood, row.region].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown location";
}
