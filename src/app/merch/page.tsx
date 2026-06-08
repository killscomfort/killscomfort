import { SectionHeading } from "@/components/ui/SectionHeading";
import { MerchCard } from "@/components/merch/MerchCard";
import { MERCH_ITEMS } from "@/lib/merch";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Merch",
  description: `Official ${SITE.name} apparel and stickers.`,
  path: "/merch",
});

export default function MerchPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="Merch"
            description="Wear the movement. Stick it everywhere."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 lg:gap-x-12">
            {MERCH_ITEMS.map((item) => (
              <MerchCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
