import Link from "next/link";

const pages = [
  { slug: "book-event", template: "Booking", url: "/lp/book-event" },
  { slug: "brand-partnership", template: "Partnership", url: "/lp/brand-partnership" },
];

export default function AdminLandingPagesPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-display text-3xl uppercase text-bone">
              Landing Pages
            </h1>
            <Link href="/admin" className="text-sm text-muted-gold hover:text-bone">
              ← Admin
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {pages.map((page) => (
              <div
                key={page.slug}
                className="flex items-center justify-between border border-clay/20 p-4"
              >
                <div>
                  <h3 className="text-bone">{page.slug}</h3>
                  <p className="text-xs text-bone/40">{page.template} template</p>
                </div>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-gold hover:text-bone"
                >
                  Preview →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
