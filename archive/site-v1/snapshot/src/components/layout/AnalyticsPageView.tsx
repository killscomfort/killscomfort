"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

function trackFirstPartyPageView(pathname: string, searchParams: URLSearchParams) {
  const utm_source = searchParams.get("utm_source");
  const utm_medium = searchParams.get("utm_medium");
  const utm_campaign = searchParams.get("utm_campaign");
  let gclid: string | null = searchParams.get("gclid");
  try {
    if (!gclid) gclid = sessionStorage.getItem("kc_gclid");
  } catch {
    // ignore
  }

  fetch("/api/analytics/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source,
      utm_medium,
      utm_campaign,
      gclid,
    }),
    keepalive: true,
  }).catch(() => {});
}

/** Sends GA4 page_view on client navigations (App Router). */
export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    trackPageView(
      typeof window !== "undefined"
        ? `${window.location.origin}${url}`
        : url
    );
    trackFirstPartyPageView(pathname, searchParams);
  }, [pathname, searchParams]);

  return null;
}
