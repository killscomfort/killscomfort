"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AcceptedPaymentMethods } from "@/components/checkout/AcceptedPaymentMethods";
import { CheckoutPaymentStep } from "@/components/checkout/CheckoutPaymentStep";
import { BOOKING_SERVICES } from "@/lib/booking-services";
import { formatPrice } from "@/lib/merch";

export function ServiceCheckoutForm({
  applePayEnabled = false,
  applePayDomainName,
}: {
  applePayEnabled?: boolean;
  applePayDomainName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("service") || BOOKING_SERVICES[0]?.slug || "";

  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState<{
    orderId: string;
    orderNumber: string;
    paypalOrderId: string;
    demoMode?: boolean;
  } | null>(null);

  const selected = BOOKING_SERVICES.find((s) => s.slug === selectedSlug);
  const totalCents = selected?.priceCents ?? 0;

  async function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;

    setLoading(true);
    setError("");
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const payload = {
      order_kind: "service" as const,
      customer_name: form.get("customer_name") as string,
      customer_email: form.get("customer_email") as string,
      customer_phone: (form.get("customer_phone") as string) || undefined,
      event_date: (form.get("event_date") as string) || undefined,
      event_notes: (form.get("event_notes") as string) || undefined,
      items: [{ slug: selected.slug, quantity: 1 }],
    };

    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setError(result.message || "Could not start checkout.");
        }
        return;
      }

      setCheckoutReady({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        paypalOrderId: result.paypalOrderId,
        demoMode: result.demoMode,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCapture(paypalOrderId: string) {
    if (!checkoutReady) return;

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: checkoutReady.orderId,
        paypalOrderId,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Payment failed.");
    }

    router.push(`/checkout/success?order=${result.orderNumber}&type=service`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <h2 className="text-display text-xl uppercase text-bone">Select a Service</h2>
        <div className="mt-6 space-y-3">
          {BOOKING_SERVICES.map((service) => (
            <label
              key={service.slug}
              className={`block cursor-pointer border p-4 transition-colors ${
                selectedSlug === service.slug
                  ? "border-muted-gold bg-muted-gold/10"
                  : "border-clay/30 bg-warm-charcoal/30 hover:border-clay/50"
              }`}
            >
              <input
                type="radio"
                name="service"
                value={service.slug}
                checked={selectedSlug === service.slug}
                onChange={() => setSelectedSlug(service.slug)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-bone">{service.name}</p>
                  <p className="mt-1 text-sm text-bone/60">{service.description}</p>
                </div>
                <p className="shrink-0 text-sm text-muted-gold">
                  {formatPrice(service.priceCents)}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border border-clay/30 bg-warm-charcoal/40 p-6">
        <h2 className="text-display text-xl uppercase text-bone">Pay & Book</h2>
        {selected && (
          <p className="mt-2 text-sm text-bone/60">
            Total: <span className="text-muted-gold">{formatPrice(totalCents)}</span>
          </p>
        )}
        <p className="mt-1 text-xs text-bone/40">
          Secure checkout — PayPal, Venmo, cards, and mobile wallets.
        </p>
        <AcceptedPaymentMethods compact />

        {!checkoutReady ? (
          <form onSubmit={handleContinue} className="mt-6 space-y-4">
            <Input
              name="customer_name"
              label="Full Name"
              required
              error={fieldErrors.customer_name}
            />
            <Input
              name="customer_email"
              type="email"
              label="Email"
              required
              error={fieldErrors.customer_email}
            />
            <Input
              name="customer_phone"
              type="tel"
              label="Phone"
              error={fieldErrors.customer_phone}
            />
            <Input
              name="event_date"
              type="date"
              label="Event Date (optional)"
              error={fieldErrors.event_date}
            />
            <Textarea
              name="event_notes"
              label="Event Details (optional)"
              placeholder="Venue, event type, special requests..."
              error={fieldErrors.event_notes}
            />

            {error && <p className="text-sm text-dried-blood">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading || !selected}>
              {loading ? "Preparing..." : "Continue to Payment"}
            </Button>
          </form>
        ) : (
          <CheckoutPaymentStep
            orderNumber={checkoutReady.orderNumber}
            paypalOrderId={checkoutReady.paypalOrderId}
            totalCents={totalCents}
            demoMode={checkoutReady.demoMode}
            error={error}
            editLabel="Edit details"
            applePayEnabled={applePayEnabled}
            applePayDomainName={applePayDomainName}
            onCapture={handleCapture}
            onError={setError}
            onEdit={() => setCheckoutReady(null)}
          />
        )}
      </div>
    </div>
  );
}
