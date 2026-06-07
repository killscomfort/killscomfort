import { Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";

export function BookSection() {
  return (
    <section id="book" className="section-padding border-t border-clay/20 bg-warm-charcoal/40 grain-overlay">
      <div className="relative mx-auto max-w-3xl">
        <SectionHeading
          label="Booking"
          title="Book Me"
          description="Clubs, festivals, private events, brand partnerships. Every inquiry gets a personal response within 24–48 hours."
          align="center"
          className="mx-auto"
        />

        <Suspense fallback={<div className="text-center text-bone/50">Loading form...</div>}>
          <InquiryForm source="home-page" />
        </Suspense>
      </div>
    </section>
  );
}
