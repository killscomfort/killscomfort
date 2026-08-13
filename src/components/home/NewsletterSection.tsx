import { Suspense } from "react";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";

export function NewsletterSection() {
  return (
    <section
      id="newsletter"
      className="section-padding !py-14 lg:!py-20 border-t border-clay/20 bg-warm-charcoal/30 grain-overlay"
    >
      <div className="relative mx-auto w-full min-w-0 max-w-3xl">
        <Suspense fallback={<div className="text-center text-bone/50">Loading…</div>}>
          <NewsletterSignup source="home" />
        </Suspense>
      </div>
    </section>
  );
}
