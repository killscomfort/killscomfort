import { Suspense } from "react";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { createMetadata } from "@/lib/seo";
import { BrandName } from "@/components/ui/BrandText";
import { SITE } from "@/lib/constants";

const landingPages: Record<
  string,
  {
    template: "booking" | "partnership";
    headline: string;
    subheadline: string;
    bullets: string[];
    testimonial?: { quote: string; author: string };
  }
> = {
  "book-event": {
    template: "booking",
    headline: "Bring Real Energy to Your Next Event",
    subheadline: "Miami-rooted. Street-tested. Built to move crowds.",
    bullets: [
      "150+ events across clubs, festivals, and private venues",
      "Versatile sets — house, techno, hip-hop, and everything between",
      "Professional from inquiry to encore",
    ],
    testimonial: {
      quote:
        "Gregory delivered exactly what we needed — raw energy with real professionalism.",
      author: "Festival Coordinator",
    },
  },
  "brand-partnership": {
    template: "partnership",
    headline: "Create Something That Moves Culture",
    subheadline:
      `Partner with ${SITE.name} for campaigns that feel real, not manufactured.`,
    bullets: [
      "Authentic storytelling rooted in Miami street culture",
      "Music production and sonic branding",
      "Content that connects — not just converts",
    ],
    testimonial: {
      quote:
        "The collaboration felt genuine. Our audience responded because it was real.",
      author: "Brand Director",
    },
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = landingPages[slug];
  if (!page) return createMetadata({ title: "Page Not Found", noIndex: true });
  return createMetadata({
    title: page.headline,
    description: page.subheadline,
    path: `/lp/${slug}`,
    noIndex: false,
  });
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const page = landingPages[slug];
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-near-black grain-overlay">
      <div className="relative">
        {/* No main navigation — conversion focused */}
        <header className="px-4 py-6 sm:px-8">
          <span className="text-2xl text-bone">
            <BrandName />
          </span>
        </header>

        <main className="mx-auto max-w-3xl px-4 pb-20 sm:px-8">
          <h1 className="text-display text-5xl uppercase leading-none text-bone sm:text-6xl">
            {page.headline}
          </h1>
          <p className="mt-4 text-lg text-bone/70">{page.subheadline}</p>

          <ul className="mt-10 space-y-4">
            {page.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 text-bone/80"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 bg-burnt-sienna" />
                {bullet}
              </li>
            ))}
          </ul>

          {page.template === "booking" && (
            <div className="mt-10 border border-clay/20 bg-warm-charcoal/30 p-6">
              <p className="text-xs text-bone/40 uppercase tracking-widest mb-3">
                Featured Mix
              </p>
              <div className="flex h-32 items-center justify-center border border-clay/10 bg-near-black/50">
                <p className="text-xs text-bone/40">
                  SoundCloud embed — configure in admin
                </p>
              </div>
            </div>
          )}

          {page.testimonial && (
            <blockquote className="mt-10 border-l-2 border-burnt-sienna pl-6">
              <p className="text-bone/80 italic">
                &ldquo;{page.testimonial.quote}&rdquo;
              </p>
              <footer className="mt-2 text-sm text-muted-gold">
                — {page.testimonial.author}
              </footer>
            </blockquote>
          )}

          {page.template === "partnership" && (
            <div className="mt-10 grid grid-cols-3 gap-3">
              {["Campaign A", "Campaign B", "Campaign C"].map((c) => (
                <div
                  key={c}
                  className="aspect-square border border-clay/20 bg-warm-charcoal/50 flex items-center justify-center text-xs text-bone/40"
                >
                  {c}
                </div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-display text-2xl uppercase text-bone mb-6">
              {page.template === "booking"
                ? "Request a Booking"
                : "Start a Conversation"}
            </h2>
            <Suspense fallback={<div className="text-bone/50">Loading...</div>}>
              <InquiryForm
                simplified={page.template === "booking"}
                source={`landing-${slug}`}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
