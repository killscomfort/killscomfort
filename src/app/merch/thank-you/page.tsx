import Image from "next/image";
import Link from "next/link";
import { ConversionTracker } from "@/components/analytics/ConversionTracker";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Order Confirmed",
  description: `Thank you for your ${SITE.name} order.`,
  path: "/merch/thank-you",
});

export default async function MerchThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const dedupeKey = sessionId ? `merch-${sessionId}` : "merch-thank-you";

  return (
    <div className="flex min-h-screen items-center justify-center bg-near-black text-bone">
      <ConversionTracker dedupeKey={dedupeKey} kind="purchase" transactionId={sessionId} />
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mx-auto mb-10 w-40">
          <Image
            src="/killspng dropshadow.png"
            alt="KillsComfort"
            width={600}
            height={200}
            className="h-auto w-full"
            priority
          />
        </div>

        <h1 className="text-display text-3xl font-bold sm:text-4xl">
          Order <span className="text-muted-gold">Confirmed</span>
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-bone/60">
          Thanks for repping KillsComfort. You&apos;ll get a receipt from Stripe
          shortly — we&apos;ll ship your order as soon as it&apos;s packed.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/merch"
            className="inline-block rounded-xl bg-muted-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-near-black transition hover:bg-desert-sand"
          >
            Shop More
          </Link>
          <Link
            href="/"
            className="inline-block rounded-xl border border-clay/30 px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-bone/60 transition hover:border-clay/50 hover:text-bone"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
