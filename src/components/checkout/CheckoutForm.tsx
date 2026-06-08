"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AcceptedPaymentMethods } from "@/components/checkout/AcceptedPaymentMethods";
import { CheckoutPaymentStep } from "@/components/checkout/CheckoutPaymentStep";
import { useCart } from "@/lib/cart/CartProvider";
import { cartHasServices, cartRequiresShipping } from "@/lib/catalog";
import { isServiceOnlyOrder } from "@/lib/orders/validation";
import { formatPrice } from "@/lib/merch";

export function CheckoutForm({
  applePayEnabled = false,
  applePayDomainName,
}: {
  applePayEnabled?: boolean;
  applePayDomainName?: string;
}) {
  const router = useRouter();
  const { items, subtotalCents, updateQuantity, removeItem, clearCart, ready } = useCart();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState<{
    orderId: string;
    orderNumber: string;
    paypalOrderId: string;
    demoMode?: boolean;
  } | null>(null);

  const cartLines = useMemo(
    () => items.map((item) => ({ slug: item.slug, quantity: item.quantity, size: item.size })),
    [items]
  );
  const requiresShipping = useMemo(() => cartRequiresShipping(cartLines), [cartLines]);
  const hasServices = useMemo(() => cartHasServices(cartLines), [cartLines]);
  const serviceOnly = useMemo(() => isServiceOnlyOrder(cartLines), [cartLines]);

  async function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const payload = {
      customer_name: form.get("customer_name") as string,
      customer_email: form.get("customer_email") as string,
      customer_phone: (form.get("customer_phone") as string) || undefined,
      items: cartLines,
      ...(requiresShipping
        ? {
            shipping_line1: form.get("shipping_line1") as string,
            shipping_line2: (form.get("shipping_line2") as string) || undefined,
            shipping_city: form.get("shipping_city") as string,
            shipping_state: form.get("shipping_state") as string,
            shipping_postal_code: form.get("shipping_postal_code") as string,
            shipping_country: "US",
          }
        : {}),
      ...(hasServices
        ? {
            event_date: (form.get("event_date") as string) || undefined,
            event_notes: (form.get("event_notes") as string) || undefined,
          }
        : {}),
    };

    try {
      const res = await fetch("/api/orders/create", {
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

    const res = await fetch("/api/orders/capture", {
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

    clearCart();
    const successType = serviceOnly ? "&type=service" : "";
    router.push(`/checkout/success?order=${result.orderNumber}${successType}`);
  }

  if (!ready) {
    return (
      <div className="border border-clay/30 bg-warm-charcoal/40 p-10 text-center">
        <p className="text-bone/70">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-clay/30 bg-warm-charcoal/40 p-10 text-center">
        <p className="text-bone/70">Your cart is empty.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/merch">Shop Merch</Button>
          <Button href="/services" variant="outline">
            Book a Service
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="text-display text-xl uppercase text-bone">Your Cart</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={`${item.slug}-${item.size ?? ""}`}
              className="flex gap-4 border border-clay/20 bg-warm-charcoal/30 p-4"
            >
              {item.image ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-warm-charcoal">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={
                      item.kind === "service"
                        ? "object-contain p-2"
                        : "object-cover"
                    }
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-clay/20 bg-warm-charcoal text-[10px] uppercase tracking-widest text-bone/40">
                  Service
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-widest text-bone/40">
                  {item.kind === "service" ? "Service" : "Merch"}
                </p>
                <p className="text-bone">{item.name}</p>
                {item.size && (
                  <p className="text-xs uppercase tracking-widest text-bone/50">
                    Size {item.size}
                  </p>
                )}
                {item.description && item.kind === "service" && (
                  <p className="mt-1 text-sm text-bone/50">{item.description}</p>
                )}
                <p className="mt-1 text-sm text-muted-gold">
                  {formatPrice(item.priceCents)} each
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-bone/70">
                    Qty
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.slug, item.size, Number(e.target.value))
                      }
                      className="border border-clay/30 bg-near-black px-2 py-1 text-bone"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug, item.size)}
                    className="text-xs uppercase tracking-widest text-bone/40 hover:text-dried-blood"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-sm text-bone">{formatPrice(item.lineTotalCents)}</p>
            </li>
          ))}
        </ul>
        {!requiresShipping && (
          <p className="mt-4 text-sm text-bone/50">
            Need merch too?{" "}
            <Link href="/merch" className="text-muted-gold hover:text-bone">
              Shop the store
            </Link>
            .
          </p>
        )}
      </div>

      <div>
        <div className="border border-clay/30 bg-warm-charcoal/40 p-6">
          <h2 className="text-display text-xl uppercase text-bone">Checkout</h2>
          <p className="mt-2 text-sm text-bone/60">
            Subtotal: <span className="text-muted-gold">{formatPrice(subtotalCents)}</span>
          </p>
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
                label="Phone (optional)"
                error={fieldErrors.customer_phone}
              />

              {hasServices && (
                <>
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
                </>
              )}

              {requiresShipping && (
                <>
                  <Input
                    name="shipping_line1"
                    label="Street Address"
                    required
                    error={fieldErrors.shipping_line1}
                  />
                  <Input
                    name="shipping_line2"
                    label="Apt / Suite (optional)"
                    error={fieldErrors.shipping_line2}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      name="shipping_city"
                      label="City"
                      required
                      error={fieldErrors.shipping_city}
                    />
                    <Input
                      name="shipping_state"
                      label="State"
                      required
                      error={fieldErrors.shipping_state}
                    />
                  </div>
                  <Input
                    name="shipping_postal_code"
                    label="ZIP Code"
                    required
                    error={fieldErrors.shipping_postal_code}
                  />
                </>
              )}

              {error && <p className="text-sm text-dried-blood">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Preparing..." : "Continue to Payment"}
              </Button>
            </form>
          ) : (
            <CheckoutPaymentStep
              orderNumber={checkoutReady.orderNumber}
              paypalOrderId={checkoutReady.paypalOrderId}
              totalCents={subtotalCents}
              demoMode={checkoutReady.demoMode}
              error={error}
              editLabel={requiresShipping ? "Edit details" : "Edit booking details"}
              applePayEnabled={applePayEnabled}
              applePayDomainName={applePayDomainName}
              onCapture={handleCapture}
              onError={setError}
              onEdit={() => setCheckoutReady(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
