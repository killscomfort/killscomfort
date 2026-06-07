import { Suspense } from "react";
import { BrandText } from "@/components/ui/BrandText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Book",
  description:
    `Book ${SITE.name} for your next event. Clubs, festivals, private events, and brand partnerships.`,
  path: "/book",
});

export default function BookPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            label="Booking"
            title="Let's Create Something Unforgettable"
            description="Direct, professional, and personal. Every inquiry gets a response within 24–48 hours."
            align="center"
            className="mx-auto"
          />

          <div className="mb-12 border border-clay/20 bg-warm-charcoal/30 p-6 text-center">
            <p className="text-xl text-bone/70">
              <BrandText variant="inline">
                &ldquo;Gregory brought an energy that transformed the entire night.
                Professional, versatile, and rooted in the culture.&rdquo;
              </BrandText>
            </p>
            <p className="mt-2 text-lg text-muted-gold">
              <BrandText variant="inline">— Event Director, Miami</BrandText>
            </p>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-widest text-bone/30">
            {["Club Space", "E11EVEN", "Treehouse", "LIV"].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>

          <p className="mb-2 text-center text-sm text-bone/50">
            Trusted by 150+ events
          </p>

          <Suspense fallback={<div className="text-center text-bone/50">Loading form...</div>}>
            <InquiryForm source="booking-page" />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
