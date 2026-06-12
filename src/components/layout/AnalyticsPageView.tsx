"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

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
  }, [pathname, searchParams]);

  return null;
}
