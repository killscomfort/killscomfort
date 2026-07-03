"use client";

import { useEffect } from "react";
import {
  trackDonate,
  trackOnce,
  trackPurchase,
} from "@/lib/analytics";

type ConversionTrackerProps = {
  dedupeKey: string;
  kind: "purchase" | "donate";
  transactionId?: string;
  value?: number;
  currency?: string;
};

export function ConversionTracker({
  dedupeKey,
  kind,
  transactionId,
  value,
  currency = "USD",
}: ConversionTrackerProps) {
  useEffect(() => {
    trackOnce(dedupeKey, () => {
      const params = {
        transaction_id: transactionId,
        value,
        currency,
      };
      if (kind === "donate") {
        trackDonate(params);
      } else {
        trackPurchase(params);
      }
    });
  }, [dedupeKey, kind, transactionId, value, currency]);

  return null;
}
