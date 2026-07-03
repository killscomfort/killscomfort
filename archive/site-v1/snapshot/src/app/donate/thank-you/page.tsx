import Image from "next/image";
import Link from "next/link";
import { ConversionTracker } from "@/components/analytics/ConversionTracker";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Thank You",
  description: `Thank you for supporting ${SITE.name}.`,
  path: "/donate/thank-you",
});

export default async function DonateThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const dedupeKey = sessionId ? `donate-${sessionId}` : "donate-thank-you";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] text-[#f0ece4]">
      <ConversionTracker dedupeKey={dedupeKey} kind="donate" transactionId={sessionId} />
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
          <span className="text-[#a0937d]">Thank</span> You
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-[#8a8a8a]">
          Your support means everything. Every dollar pushes KillsComfort
          further — new music, new tools, new experiences. Growth lives on the
          other side.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/music"
            className="inline-block rounded-xl bg-muted-gold px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-near-black transition hover:bg-desert-sand"
          >
            Hear the Music
          </Link>
          <Link
            href="/"
            className="inline-block rounded-xl border border-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-[#8a8a8a] transition hover:border-white/20 hover:text-[#f0ece4]"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
