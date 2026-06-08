import { Suspense } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCheckoutForm } from "@/components/checkout/ServiceCheckoutForm";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Book & Pay",
  description: `Pay for DJ bookings, lessons, and event tickets with PayPal — ${SITE.name}.`,
  path: "/book/pay",
});

export default function BookPayPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            label="Booking"
            title="Book & Pay"
            description="Select a service and pay securely with PayPal, Venmo, or card."
            align="center"
            className="mx-auto"
          />

          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-bone/50">
            Need a custom quote first?{" "}
            <Link href="/book" className="text-muted-gold hover:text-bone">
              Send an inquiry instead
            </Link>
            .
          </p>

          <div className="mt-12">
            <Suspense fallback={<p className="text-center text-bone/50">Loading...</p>}>
              <ServiceCheckoutForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
