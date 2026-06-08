import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Order Confirmed",
  description: "Your order has been placed.",
  path: "/checkout/success",
});

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; type?: string }>;
}) {
  const { order, type } = await searchParams;
  const isService = type === "service";

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-display text-3xl uppercase text-bone">
            {isService ? "Booking Confirmed" : "Order Confirmed"}
          </h1>
          {order && (
            <p className="mt-4 text-muted-gold">
              Order <strong>{order}</strong>
            </p>
          )}
          <p className="mt-6 text-bone/70">
            {isService
              ? "Thanks for your payment. We'll follow up within 24–48 hours to confirm your booking details."
              : "Thanks for your order. A confirmation email is on its way. We'll follow up when your merch ships."}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button href={isService ? "/book" : "/merch"}>
              {isService ? "Back to Book" : "Continue Shopping"}
            </Button>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-clay/60 px-6 py-3 text-sm text-bone hover:border-muted-gold"
            >
              Back Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
