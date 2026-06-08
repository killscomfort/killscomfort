import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { createMetadata } from "@/lib/seo";
import { getApplePayDomainName, isApplePayEnabled } from "@/lib/apple-pay";

export const metadata = createMetadata({
  title: "Checkout",
  description: "Complete your KillsComfort merch order.",
  path: "/checkout",
});

export default function CheckoutPage() {
  const applePayEnabled = isApplePayEnabled();
  const applePayDomainName = getApplePayDomainName();

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="Checkout"
            description="Merch, bookings, lessons, and tickets — one cart, one checkout."
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <CheckoutForm
              applePayEnabled={applePayEnabled}
              applePayDomainName={applePayDomainName}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
