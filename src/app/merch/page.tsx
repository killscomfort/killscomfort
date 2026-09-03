import { SectionHeading } from "@/components/ui/SectionHeading";
import { MerchShop } from "@/components/merch/MerchShop";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Merch",
  description: `Official ${SITE.name} apparel.`,
  path: "/merch",
});

export default function MerchPage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      <section className="section-shell">
        <div className="glass-panel p-6 sm:p-10">
          <SectionHeading
            title="Merch"
            description="Wear the movement."
            align="center"
            className="mx-auto"
          />

          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-near-black/55">
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
