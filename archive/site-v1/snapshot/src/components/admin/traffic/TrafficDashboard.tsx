"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminCard";
import { TrafficLineChart } from "@/components/admin/traffic/TrafficLineChart";
import { TrafficUsaMap } from "@/components/admin/traffic/TrafficUsaMap";
import { IpExclusionPanel } from "@/components/admin/traffic/IpExclusionPanel";
import {
  formatReferrerDisplay,
  formatVisitLocation,
  type TrafficDashboardData,
} from "@/lib/traffic/queries";
import { TRAFFIC_RANGE_OPTIONS, type TrafficRange } from "@/lib/traffic/ranges";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

type Props = {
  initialData: TrafficDashboardData;
  initialRange: TrafficRange;
  initialUnique: boolean;
};

function formatVisitTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TrafficDashboard({
  initialData,
  initialRange,
  initialUnique,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const range = (searchParams.get("range") as TrafficRange) || initialRange;
  const uniqueOnly =
    searchParams.get("unique") === "true" ||
    (searchParams.get("unique") === null && initialUnique);

  const fetchDashboard = useCallback(
    async (nextOffset = 0, append = false) => {
      const params = new URLSearchParams({
        range,
        unique: String(uniqueOnly),
        offset: String(nextOffset),
        limit: String(PAGE_SIZE),
      });

      const res = await fetch(`/api/admin/traffic?${params}`);
      if (!res.ok) return;
      const json = (await res.json()) as TrafficDashboardData;

      if (append) {
        setData((prev) => ({
          ...prev,
          visits: [...prev.visits, ...json.visits],
        }));
      } else {
        setData(json);
        setOffset(PAGE_SIZE);
      }
    },
    [range, uniqueOnly]
  );

  useEffect(() => {
    setLoading(true);
    fetchDashboard(0, false).finally(() => setLoading(false));
  }, [fetchDashboard]);

  function setRange(next: TrafficRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    router.push(`/admin/traffic?${params.toString()}`);
  }

  function toggleUnique() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("unique", String(!uniqueOnly));
    router.push(`/admin/traffic?${params.toString()}`);
  }

  async function loadMore() {
    setLoadingMore(true);
    await fetchDashboard(offset, true);
    setOffset((prev) => prev + PAGE_SIZE);
    setLoadingMore(false);
  }

  const hasMore = data.visits.length < data.total;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {TRAFFIC_RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRange(opt.value)}
            className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-widest transition-colors",
              range === opt.value
                ? "bg-muted-gold text-near-black"
                : "border border-clay/30 text-bone/60 hover:text-bone"
            )}
          >
            {opt.label}
          </button>
        ))}

        <button
          type="button"
          onClick={toggleUnique}
          className={cn(
            "ml-auto px-3 py-1.5 text-xs uppercase tracking-widest transition-colors",
            uniqueOnly
              ? "bg-muted-gold text-near-black"
              : "border border-clay/30 text-bone/60 hover:text-bone"
          )}
        >
          Unique IPs only
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <p className="text-xs uppercase tracking-widest text-bone/45">Visits</p>
          <p className="mt-2 text-3xl text-bone">{data.total}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs uppercase tracking-widest text-bone/45">Cities</p>
          <p className="mt-2 text-3xl text-bone">{data.locations.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs uppercase tracking-widest text-bone/45">Referrers</p>
          <p className="mt-2 text-3xl text-bone">{data.referrers.length}</p>
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="mb-4 text-lg text-bone">Last 30 days</h3>
        <TrafficLineChart data={data.chart} />
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h3 className="mb-4 text-lg text-bone">USA traffic map</h3>
          <TrafficUsaMap points={data.mapPoints} />
        </AdminCard>

        <AdminCard>
          <h3 className="mb-4 text-lg text-bone">By city &amp; neighborhood</h3>
          <ul className="max-h-80 space-y-3 overflow-y-auto text-sm">
            {data.locations.length === 0 ? (
              <li className="text-bone/50">No location data in this range.</li>
            ) : (
              data.locations.slice(0, 12).map((loc) => (
                <li
                  key={`${loc.city}-${loc.neighborhood}-${loc.region}`}
                  className="flex items-start justify-between gap-4 border-b border-clay/15 pb-2"
                >
                  <div>
                    <p className="text-bone">{loc.city}</p>
                    {loc.neighborhood && (
                      <p className="text-bone/55">{loc.neighborhood}</p>
                    )}
                    {loc.region && (
                      <p className="text-bone/40">{loc.region}</p>
                    )}
                  </div>
                  <span className="text-muted-gold">{loc.count}</span>
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="mb-4 text-lg text-bone">Referrals &amp; campaigns</h3>
        <ul className="space-y-3 text-sm">
          {data.referrers.length === 0 ? (
            <li className="text-bone/50">No referral data in this range.</li>
          ) : (
            data.referrers.slice(0, 15).map((ref) => (
              <li
                key={`${ref.referrer}-${ref.campaignId}`}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-clay/15 pb-2"
              >
                <div>
                  <p className="text-bone">{ref.referrer}</p>
                  {ref.isGoogle && (
                    <p className="text-bone/55">
                      Google
                      {ref.campaignId ? (
                        <>
                          {" "}
                          · campaign / gclid:{" "}
                          <span className="font-mono text-muted-gold">
                            {ref.campaignId}
                          </span>
                        </>
                      ) : (
                        " · no campaign id"
                      )}
                    </p>
                  )}
                </div>
                <span className="text-muted-gold">{ref.count}</span>
              </li>
            ))
          )}
        </ul>
      </AdminCard>

      <AdminCard>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg text-bone">Recent visitors</h3>
          {loading && <span className="text-xs text-bone/45">Updating…</span>}
        </div>

        <ul className="space-y-4">
          {data.visits.length === 0 ? (
            <li className="text-sm text-bone/50">
              No visits recorded for this range yet. Traffic is captured as people
              browse the site.
            </li>
          ) : (
            data.visits.map((visit) => {
              const ref = formatReferrerDisplay(visit);
              return (
                <li
                  key={visit.id}
                  className="border border-clay/20 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-bone">
                        {visit.visitor_ip || "Unknown IP"}
                      </p>
                      <p className="mt-1 text-bone/70">
                        {formatVisitLocation(visit)}
                      </p>
                    </div>
                    <p className="text-bone/45">{formatVisitTime(visit.created_at)}</p>
                  </div>
                  <div className="mt-3 grid gap-1 text-bone/60 sm:grid-cols-2">
                    <p>
                      Page:{" "}
                      <Link href={visit.path} className="text-muted-gold hover:text-bone">
                        {visit.path}
                      </Link>
                    </p>
                    <p>
                      Referrer: {ref.label}
                      {ref.isGoogle && ref.campaignId && (
                        <span className="ml-1 font-mono text-muted-gold">
                          ({ref.campaignId})
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mt-6 w-full border border-clay/30 py-3 text-xs uppercase tracking-widest text-bone/70 hover:border-muted-gold hover:text-bone"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}
      </AdminCard>

      <AdminCard>
        <IpExclusionPanel
          excludedIps={data.excludedIps}
          onChanged={() => fetchDashboard(0, false)}
        />
      </AdminCard>
    </div>
  );
}
