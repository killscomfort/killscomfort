import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Checkout",
  description: "Complete your KillsComfort merch order.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="Checkout"
            description="Apple Pay, Google Pay, PayPal, Venmo, and cards."
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <CheckoutForm />
          </div>
        </div>
      </section>
    </div>
  );
}
