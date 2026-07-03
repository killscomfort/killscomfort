import { Hero } from "@/components/home/Hero";
import { WhoIs } from "@/components/home/WhoIs";
import { WhatIDo } from "@/components/home/WhatIDo";
import { BookSection } from "@/components/home/BookSection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section id="play" className="border-t border-clay/15 bg-near-black px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-gold">The ride</p>
          <h2 className="text-display mt-3 text-3xl uppercase text-bone sm:text-4xl">
            Motion Is Faith
          </h2>
          <p className="mt-4 max-w-xl text-bone/70">
            Roll through the alley into the warehouse — build a beat, dig crates, and find what&apos;s stashed inside.
          </p>
          <Link
            href="/ride"
            className="mt-8 inline-flex border border-clay/30 bg-muted-gold/10 px-8 py-4 font-mono text-sm uppercase tracking-[0.2em] text-bone transition-colors hover:border-muted-gold/50 hover:bg-muted-gold/20"
          >
            Enter the ride →
          </Link>
        </div>
      </section>
      <WhoIs />
      <WhatIDo />
      <BookSection />
    </>
  );
}

