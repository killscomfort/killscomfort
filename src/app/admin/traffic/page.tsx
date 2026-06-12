import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TrafficDashboard } from "@/components/admin/traffic/TrafficDashboard";
import { getAdminServiceClient } from "@/lib/admin/auth";
import { fetchTrafficDashboard } from "@/lib/traffic/queries";
import type { TrafficRange } from "@/lib/traffic/ranges";

type Props = {
  searchParams: Promise<{ range?: string; unique?: string }>;
};

const RANGES = new Set<TrafficRange>([
  "today",
  "yesterday",
  "7d",
  "30d",
  "all",
]);

export default async function AdminTrafficPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = RANGES.has(params.range as TrafficRange)
    ? (params.range as TrafficRange)
    : "today";
  const uniqueOnly = params.unique === "true";

  const supabase = await getAdminServiceClient();
  const initialData = await fetchTrafficDashboard(supabase, {
    range,
    uniqueOnly,
    offset: 0,
    limit: 5,
  });

  return (
    <>
      <AdminPageHeader
        title="Traffic"
        description="First-party visitor analytics — IPs, locations, referrers, and Google campaigns."
      />

      <Suspense fallback={<p className="text-bone/50">Loading traffic…</p>}>
        <TrafficDashboard
          initialData={initialData}
          initialRange={range}
          initialUnique={uniqueOnly}
        />
      </Suspense>
    </>
  );
}
