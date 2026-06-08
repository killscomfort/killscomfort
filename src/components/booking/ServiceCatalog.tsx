"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/CartProvider";
import { BOOKING_SERVICES } from "@/lib/booking-services";
import { formatPrice } from "@/lib/merch";

export function ServiceCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, ready } = useCart();
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  useEffect(() => {
    const slug = searchParams.get("service");
    if (!slug || !ready) return;

    const service = BOOKING_SERVICES.find((item) => item.slug === slug);
    if (!service) return;

    addItem({ slug: service.slug, quantity: 1 });
    router.replace("/checkout");
  }, [addItem, ready, router, searchParams]);

  function handleAdd(slug: string) {
    addItem({ slug, quantity: 1 });
    setAddedSlug(slug);
    setTimeout(() => setAddedSlug(null), 2000);
  }

  return (
    <div className="space-y-3">
      {BOOKING_SERVICES.map((service) => (
        <article
          key={service.slug}
          className="flex flex-col gap-4 border border-clay/30 bg-warm-charcoal/30 p-5 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-gold">Service</p>
            <h3 className="mt-1 text-lg text-bone">{service.name}</h3>
            <p className="mt-2 text-sm text-bone/60">{service.description}</p>
            <p className="mt-3 text-sm text-muted-gold">{formatPrice(service.priceCents)}</p>
          </div>
          <Button
            type="button"
            className="shrink-0 sm:min-w-40"
            onClick={() => handleAdd(service.slug)}
          >
            {addedSlug === service.slug ? "Added to Cart" : "Add to Cart"}
          </Button>
        </article>
      ))}

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button href="/checkout" className="w-full sm:w-auto">
          Go to Checkout
        </Button>
        <Link
          href="/book"
          className="inline-flex items-center justify-center border border-clay/60 px-6 py-3 text-sm text-bone hover:border-muted-gold"
        >
          Need a custom quote?
        </Link>
      </div>
    </div>
  );
}
