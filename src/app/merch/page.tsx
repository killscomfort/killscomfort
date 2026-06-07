import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MERCH_ITEMS } from "@/lib/merch";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Merch",
  description: `Official ${SITE.name} apparel and stickers.`,
  path: "/merch",
});

export default function MerchPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="Merch"
            description="Wear the movement. Stick it everywhere."
            align="center"
            className="mx-auto"
          />

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 lg:gap-x-12">
            {MERCH_ITEMS.map((item) => (
              <article key={item.name} className="group">
                <div className="relative aspect-square overflow-hidden bg-warm-charcoal">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                      item.image.endsWith(".png") && item.name.includes("Sticker")
                        ? "object-contain p-12"
                        : ""
                    }`}
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-gold">
                    {item.price}
                  </p>
                  <h3 className="mt-1 text-lg uppercase text-bone">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bone/60">
                    {item.description}
                  </p>
                  {item.sizes && (
                    <p className="mt-3 text-[10px] uppercase tracking-widest text-bone/40">
                      Sizes {item.sizes.join(" · ")}
                    </p>
                  )}
                  <a
                    href={item.shopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-[11px] uppercase tracking-widest text-bone/75 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-muted-gold hover:decoration-muted-gold"
                  >
                    {item.actionLabel}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
