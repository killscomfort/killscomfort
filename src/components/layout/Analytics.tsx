import Script from "next/script";
import { Suspense } from "react";
import { AnalyticsPageView } from "@/components/layout/AnalyticsPageView";
import { getAnalyticsConfig } from "@/lib/analytics-config";

export function Analytics() {
  const {
    gaId,
    googleAdsId,
    gtmId,
    gtagPrimaryId,
    googleTagEnabled,
    anyGoogleEnabled,
  } = getAnalyticsConfig();
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

  const gtagConfigLines: string[] = [];
  if (googleAdsId) {
    gtagConfigLines.push(`gtag('config','${googleAdsId}');`);
  }
  if (gaId) {
    gtagConfigLines.push(`gtag('config','${gaId}',{send_page_view:false});`);
  }

  return (
    <>
      {gtmId && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {googleTagEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagPrimaryId}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            window.gtag=gtag;
            gtag('js',new Date());
            (function(){try{var p=new URLSearchParams(window.location.search);var g=p.get('gclid');if(g)sessionStorage.setItem('kc_gclid',g);}catch(e){}})();
            ${gtagConfigLines.join("")}`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {anyGoogleEnabled && (
        <Suspense fallback={null}>
          <AnalyticsPageView />
        </Suspense>
      )}
    </>
  );
}
