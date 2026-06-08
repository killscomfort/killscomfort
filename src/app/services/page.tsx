import { Suspense } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCatalog } from "@/components/booking/ServiceCatalog";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Services",
  description: `DJ booking deposits, private lessons, and event tickets — ${SITE.name}.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            label="Booking"
            title="Services"
            description="Deposits, lessons, and tickets — add to cart and checkout securely."
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
            <Suspense fallback={<p className="text-center text-bone/50">Loading services...</p>}>
              <ServiceCatalog />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
