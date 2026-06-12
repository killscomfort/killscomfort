"use client";

/** Client-side Google Analytics / Google Ads event helpers. */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export type LeadEventParams = {
  event_type?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type PurchaseEventParams = {
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: { item_name: string; item_category?: string }[];
};

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function gtagEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
  pushDataLayer({ event: eventName, ...params });
}

function googleAdsConversion(sendTo: string, params?: Record<string, unknown>) {
  gtagEvent("conversion", { send_to: sendTo, ...params });
}

function combineSendTo(
  adsId: string | undefined,
  label: string | undefined
): string {
  const id = adsId?.trim();
  const l = label?.trim();
  if (!id || !l) return "";
  return `${id}/${l}`;
}

function getLeadSendTo() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO?.trim() ||
    combineSendTo(
      process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL
    )
  );
}

function getPurchaseSendTo() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO?.trim() ||
    combineSendTo(
      process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL
    )
  );
}

function getDonateSendTo() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADS_DONATE_SEND_TO?.trim() ||
    combineSendTo(
      process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DONATE_LABEL
    )
  );
}

/** GA4 recommended event for lead form submissions (Google Ads: Submit lead form). */
export function trackGenerateLead(params: LeadEventParams = {}) {
  const payload = {
    event_category: "engagement",
    event_label: params.event_type,
    lead_source: params.utm_source || params.source || "website",
    ...(params.utm_source && { utm_source: params.utm_source }),
    ...(params.utm_medium && { utm_medium: params.utm_medium }),
    ...(params.utm_campaign && { utm_campaign: params.utm_campaign }),
  };

  gtagEvent("generate_lead", payload);

  const sendTo = getLeadSendTo();
  if (sendTo) {
    googleAdsConversion(sendTo, {
      event_callback: undefined,
      ...payload,
    });
  }
}

/** GA4 recommended purchase event (merch / cart checkout). */
export function trackPurchase(params: PurchaseEventParams = {}) {
  const payload = {
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency || "USD",
    items: params.items,
  };

  gtagEvent("purchase", payload);

  const sendTo = getPurchaseSendTo();
  if (sendTo) {
    googleAdsConversion(sendTo, {
      value: params.value,
      currency: params.currency || "USD",
      transaction_id: params.transaction_id,
    });
  }
}

/** Donation completed (Stripe / donate flow). */
export function trackDonate(params: PurchaseEventParams = {}) {
  const payload = {
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency || "USD",
    items: params.items ?? [{ item_name: "Donation", item_category: "donation" }],
  };

  gtagEvent("donate", payload);
  gtagEvent("purchase", payload);

  const sendTo = getDonateSendTo() || getPurchaseSendTo();
  if (sendTo) {
    googleAdsConversion(sendTo, {
      value: params.value,
      currency: params.currency || "USD",
      transaction_id: params.transaction_id,
    });
  }
}

export function trackPageView(url: string) {
  gtagEvent("page_view", {
    page_location: url,
    page_path: typeof window !== "undefined" ? window.location.pathname : url,
  });
}

const DEDUPE_PREFIX = "kc_tracked_";

/** Fire a conversion once per browser session (thank-you page refreshes). */
export function trackOnce(
  key: string,
  tracker: () => void
) {
  if (typeof window === "undefined") return;
  const storageKey = `${DEDUPE_PREFIX}${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // sessionStorage unavailable — still track
  }
  tracker();
}
