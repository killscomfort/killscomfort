import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/constants";
import { FEATURED_LIVE_SET } from "@/lib/live-set";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

const set = FEATURED_LIVE_SET;

export const metadata = createMetadata({
  title: "Events",
  description: `${set.title} ${set.credit} — the latest live set from ${SITE.name}. Watch on YouTube or listen on SoundCloud.`,
  path: "/events",
});

function liveSetJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: set.youtube.title,
    description: set.description,
    thumbnailUrl: `https://i.ytimg.com/vi/${set.youtube.id}/hqdefault.jpg`,
    uploadDate: `${set.postedAt}T00:00:00-04:00`,
    duration: set.durationIso,
    embedUrl: set.youtube.embedUrl.split("?")[0],
    contentUrl: set.youtube.url,
    publisher: {
      "@type": "MusicGroup",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export default function EventsPage() {
  return (
    <div className="pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(liveSetJsonLd()) }}
      />

      <section className="section-padding">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            label="Events"
            title="Latest Live Set"
            description={`${set.lede} ${set.description}`}
          />

          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.35em] text-bone/50">
            {formatDate(set.postedAt)}
            <span className="text-bone/25"> · </span>
            {set.durationLabel}
            <span className="text-bone/25"> · </span>
            {set.venue}
          </p>

          <h3 className="text-display text-2xl uppercase leading-tight text-bone sm:text-3xl">
            {set.title}
          </h3>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-bone/55 sm:text-base">
            {set.credit}
          </p>

          <div className="relative mt-8 aspect-video w-full overflow-hidden border border-clay/20 bg-near-black">
            <iframe
              src={set.youtube.embedUrl}
              title={set.youtube.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={set.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-muted-gold/60 bg-muted-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-gold transition-colors hover:bg-muted-gold hover:text-near-black"
            >
              Watch on YouTube
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={set.soundcloud.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-clay/40 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-bone/80 transition-colors hover:border-muted-gold hover:text-muted-gold"
            >
              Listen on SoundCloud
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-10 border border-clay/15 bg-warm-charcoal/40 p-1">
            <iframe
              src={set.soundcloud.embedUrl}
              title={set.soundcloud.title}
              className="w-full"
              height={166}
              scrolling="no"
              allow="autoplay"
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-bone/55">
            Live art by{" "}
            {set.painters.map((painter, index) => (
              <span key={painter.name}>
                {index > 0 && (index === set.painters.length - 1 ? " + " : ", ")}
                <a
                  href={painter.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bone/80 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-muted-gold hover:decoration-muted-gold"
                >
                  {painter.name}
                </a>
              </span>
            ))}
            . Set by {SITE.name}.
          </p>

          <div className="mt-16 border-t border-clay/15 pt-12 text-center">
            <p className="text-sm leading-relaxed text-bone/60 sm:text-base">
              Want this energy in the room? Reach out for clubs, studios,
              festivals, and private nights.
            </p>
            <Button href="/book" size="lg" className="mt-6">
              Book an Inquiry
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
