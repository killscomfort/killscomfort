import { SectionHeading } from "@/components/ui/SectionHeading";
import { MerchShop } from "@/components/merch/MerchShop";
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

          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-bone/50">
            Add to cart, then checkout securely with Stripe · Apple Pay · Google Pay · Cards
          </p>

          <div className="mt-12">
            <MerchShop />
          </div>
        </div>
      </section>
    </div>
  );
}
