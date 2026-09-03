import Image from "next/image";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { ABOUT_GALLERY_IMAGES, ABOUT_HERO_IMAGE, FOUNDER_BIO } from "@/lib/about";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "About",
  description: `What ${SITE.name} is — ${SITE.founder}'s story, philosophy, and work from Miami.`,
  path: "/about",
});

const offerings = [
  {
    title: "DJ Sets",
    description:
      "Versatile, high-energy sets for clubs, festivals, and private events. House, techno, hip-hop — built to read the room and move the crowd.",
  },
  {
    title: "Production & Sound",
    description:
      "Original tracks, remixes, sonic branding, and sound engineering — studio-trained at SAE Institute, with the grit of the streets and the polish of experience.",
  },
  {
    title: "Event Curation",
    description:
      "End-to-end creative direction — vibe, sound, energy. Events that feel intentional, not manufactured.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24">
      <section className="section-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-display text-5xl uppercase text-near-black sm:text-6xl">
            What Is {SITE.name}?
          </h1>

          <div className="mt-12 space-y-8 text-lg leading-relaxed text-near-black/80 sm:text-xl">
            <p>{SITE.name} is a reminder.</p>
            <p>
              To stay active. To stay curious. To keep evolving even when life
              gets heavy.
            </p>
            <p>
              {SITE.name} means killing stagnation. Killing fear. Killing the
              version of yourself that stopped believing in possibility.
            </p>
            <p>
              And replacing it with movement, spirit, community, and intention.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto aspect-[16/10] max-w-4xl overflow-hidden">
          <Image
            src={ABOUT_HERO_IMAGE}
            alt={`${SITE.name} — movement, spirit, community`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
          />
        </div>
      </section>

      <section className="section-shell mt-6">
        <div className="mx-auto max-w-2xl space-y-6 text-base leading-relaxed text-near-black/70 sm:text-lg">
          <p>
            {SITE.founder} grew up in Miami — a melting pot where every block
            carries a different rhythm. An {SITE.founderEducation}, he honed the
            craft in the studio; the streets taught him grit, gratitude, and the
            power of showing up for others.
          </p>
          <p>
            <strong className="text-near-black">{SITE.name}</strong> isn&apos;t just a
            name. It&apos;s a philosophy. {SITE.tagline}. Every set, every track,
            every event is an invitation to step past what&apos;s familiar and
            find something real.
          </p>
          <p>{FOUNDER_BIO}</p>
          <p>
            Music isn&apos;t ego here — it&apos;s service. Creating experiences
            for others, building safe spaces for creative expression, and
            connecting people through energy that feels rooted, not manufactured.
          </p>
        </div>
      </section>

      <section className="section-shell mt-6 border-t border-clay/50 pt-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
            {ABOUT_GALLERY_IMAGES.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-clay/70 bg-desert-sand"
              >
                <Image
                  src={src}
                  alt={`${SITE.name} photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-6 border-t border-clay/50 pt-10">
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-display text-center text-4xl uppercase text-near-black sm:text-5xl">
            What I Do
          </h2>
          <p className="mt-4 text-center text-sm text-near-black/55">
            Three lanes. One mission — create experiences that connect.
          </p>

          <div className="mt-12 space-y-10">
            {offerings.map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-lg uppercase tracking-wide text-burnt-sienna">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-near-black/65 sm:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/music"
              className="text-xs uppercase tracking-[0.3em] text-near-black/60 underline decoration-near-black/25 underline-offset-4 transition-colors hover:text-near-black"
            >
              Hear the music
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
