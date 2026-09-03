import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { createMetadata } from "@/lib/seo";
import { getApplePayDomainName, isApplePayEnabled } from "@/lib/apple-pay";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata = createMetadata({
  title: "Checkout",
  description: "Complete your KillsComfort merch order.",
  path: "/checkout",
});

export default function CheckoutPage() {
  const applePayEnabled = isApplePayEnabled();
  const applePayDomainName = getApplePayDomainName();
  const stripeConfigured = isStripeConfigured();

  return (
    <div className="min-h-screen pt-28 pb-24">
      <section className="section-shell">
        <div className="glass-panel p-6 sm:p-10">
          <SectionHeading
            title="Checkout"
            description="Merch — cart, then Stripe checkout."
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <CheckoutForm
              applePayEnabled={applePayEnabled}
              applePayDomainName={applePayDomainName}
              stripeConfigured={stripeConfigured}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
