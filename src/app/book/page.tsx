import { Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InquiryForm } from "@/components/forms/InquiryForm";
import {
  BookingCredibility,
  BookingTestimonial,
} from "@/components/booking/BookingCredibility";
import { BookingDepositCta } from "@/components/booking/BookingDepositCta";
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
    <div className="min-h-screen pt-28 pb-24">
      <section className="section-shell">
        <div className="glass-panel mx-auto w-full min-w-0 max-w-3xl p-6 sm:p-10">
          <SectionHeading
            label="Booking"
            title="Let's Create Something Unforgettable"
            description="Every inquiry gets a response within 24 hours."
            align="center"
            className="mx-auto"
          />

          <div className="mt-12">
            <BookingCredibility />

            <Suspense fallback={<div className="text-center text-bone/50">Loading form...</div>}>
              <InquiryForm source="booking-page" bookingPage />
            </Suspense>

            <BookingTestimonial />
            <BookingDepositCta />
          </div>
        </div>
      </section>
    </div>
  );
}
