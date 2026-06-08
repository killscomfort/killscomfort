import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HOME_ARTIST_IMAGE, FOUNDER_BIO } from "@/lib/about";
import { SITE } from "@/lib/constants";

export function WhoIs() {
  return (
    <section className="section-padding bg-warm-charcoal grain-overlay">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={HOME_ARTIST_IMAGE}
              alt={`${SITE.founder} — skateboarding`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-near-black/60 to-transparent" />
          </div>

          <div>
            <SectionHeading
              label="The Artist"
              title={`Who Is ${SITE.name}`}
              description={FOUNDER_BIO}
            />
            <p className="text-bone/70 leading-relaxed">
              For cold traffic and first-time visitors: this isn&apos;t a template DJ page.
              {SITE.name} is rooted in Miami&apos;s melting pot — every set, every production,
              every event is built to move people and create safe spaces for expression.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
