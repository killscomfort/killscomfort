import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCatalog } from "@/components/booking/ServiceCatalog";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Services",
  description: `AI fluency consultation, audio engineering, and AV production support from ${SITE.name}.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            label="Offerings"
            title="Services"
            description="What I can help with — reach out and we'll shape the right fit."
            align="center"
            className="mx-auto"
          />

          <div className="mt-10">
            <ServiceCatalog />
          </div>
        </div>
      </section>
    </div>
  );
}
