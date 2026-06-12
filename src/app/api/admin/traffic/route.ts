import { NextRequest, NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/admin/auth";
import { fetchTrafficDashboard } from "@/lib/traffic/queries";
import type { TrafficRange } from "@/lib/traffic/ranges";

const RANGES = new Set<TrafficRange>([
  "today",
  "yesterday",
  "7d",
  "30d",
  "all",
]);

export async function GET(request: NextRequest) {
  try {
    const supabase = await getAdminServiceClient();
    const { searchParams } = request.nextUrl;

    const rangeParam = searchParams.get("range") || "today";
    const range = RANGES.has(rangeParam as TrafficRange)
      ? (rangeParam as TrafficRange)
      : "today";
    const uniqueOnly = searchParams.get("unique") === "true";
    const offset = Math.max(0, Number(searchParams.get("offset") || 0));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 5)));

    const data = await fetchTrafficDashboard(supabase, {
      range,
      uniqueOnly,
      offset,
      limit,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" || message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
