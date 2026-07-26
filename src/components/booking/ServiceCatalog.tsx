import { SITE } from "@/lib/constants";
import { BOOKING_SERVICES } from "@/lib/booking-services";

function mailtoForService(name: string) {
  const subject = encodeURIComponent(`${SITE.name} — ${name} inquiry`);
  const body = encodeURIComponent(
    `Hi Gregory,\n\nI'm interested in ${name}.\n\nDetails:\n`
  );
  return `mailto:${SITE.email}?subject=${subject}&body=${body}`;
}

export function ServiceCatalog() {
  return (
    <div className="space-y-2">
      {BOOKING_SERVICES.map((service) => (
        <article
          key={service.slug}
          className="flex flex-col gap-3 border border-clay/30 bg-warm-charcoal/30 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-base text-bone">{service.name}</h3>
            <p className="mt-1 text-sm leading-snug text-bone/60">
              {service.description}
            </p>
          </div>
          <a
            href={mailtoForService(service.name)}
            className="inline-flex shrink-0 items-center justify-center border border-muted-gold/50 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-muted-gold transition-colors hover:bg-muted-gold/10 sm:min-w-36"
          >
            Email Me
          </a>
        </article>
      ))}

      <p className="pt-4 text-center text-sm text-bone/50">
        Prefer a direct line?{" "}
        <a
          href={`mailto:${SITE.email}`}
          className="text-muted-gold transition-colors hover:text-bone"
        >
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
