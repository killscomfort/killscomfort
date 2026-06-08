import Script from "next/script";

/** Required for Apple Pay and Google Pay via PayPal SDK v6. */
export function CheckoutPaymentScripts() {
  return (
    <>
      <Script
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <Script
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="lazyOnload"
      />
    </>
  );
}
