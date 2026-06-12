/** Server-safe analytics IDs from env (used by Analytics script loader). */

function combineSendTo(
  adsId: string | undefined,
  label: string | undefined
): string | undefined {
  const id = adsId?.trim();
  const l = label?.trim();
  if (!id || !l) return undefined;
  return `${id}/${l}`;
}

export function getAnalyticsConfig() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "";
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";

  const leadSendTo =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_SEND_TO?.trim() ||
    combineSendTo(
      googleAdsId,
      process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL?.trim()
    ) ||
    "";

  const purchaseSendTo =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO?.trim() ||
    combineSendTo(
      googleAdsId,
      process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL?.trim()
    ) ||
    "";

  const donateSendTo =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_DONATE_SEND_TO?.trim() ||
    combineSendTo(
      googleAdsId,
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DONATE_LABEL?.trim()
    ) ||
    "";

  const gtagPrimaryId = googleAdsId || gaId;
  const googleTagEnabled = Boolean(gtagPrimaryId);
  const anyGoogleEnabled = googleTagEnabled || Boolean(gtmId);

  return {
    gaId,
    googleAdsId,
    gtmId,
    gtagPrimaryId,
    googleTagEnabled,
    anyGoogleEnabled,
    leadSendTo,
    purchaseSendTo,
    donateSendTo,
  };
}
