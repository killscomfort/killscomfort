"use client";

import Script from "next/script";

/** Apple Pay + Google Pay SDKs — load before wallet buttons on checkout. */
export function CheckoutPaymentScripts() {
  return (
    <>
      <Script
        id="apple-pay-sdk"
        src="https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        id="google-pay-sdk"
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="afterInteractive"
      />
    </>
  );
}
