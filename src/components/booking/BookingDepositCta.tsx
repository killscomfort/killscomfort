import { SITE } from "@/lib/constants";

export function BookingDepositCta() {
  return (
    <div className="mt-16 border border-clay/20 p-8 text-center">
      <h3 className="mb-2 text-lg font-bold text-bone">Looking for services?</h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-bone/60">
        AI fluency consultation, audio engineering, and AV production support —
        email me and we&apos;ll figure out the right next step.
      </p>
      <a
        href={`mailto:${SITE.email}?subject=${encodeURIComponent(`${SITE.name} — services inquiry`)}`}
        className="inline-block border border-muted-gold/50 px-6 py-3 text-sm text-muted-gold transition-colors duration-200 hover:bg-muted-gold/10"
      >
        Email Me
      </a>
    </div>
  );
}
