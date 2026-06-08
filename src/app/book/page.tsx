import Link from "next/link";
import { Suspense } from "react";
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

          <Suspense fallback={<div className="text-center text-bone/50">Loading form...</div>}>
            <InquiryForm source="booking-page" />
          </Suspense>

          <div className="mt-12 border border-clay/30 bg-warm-charcoal/30 p-8 text-center">
            <h3 className="text-display text-xl uppercase text-bone">Ready to Pay?</h3>
            <p className="mt-3 text-sm text-bone/60">
              Book a deposit, private lesson, or event ticket with PayPal, Venmo, or card.
            </p>
            <Link
              href="/book/pay"
              className="mt-6 inline-flex items-center justify-center bg-muted-gold px-8 py-3 text-sm text-near-black hover:bg-desert-sand"
            >
              Book & Pay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
