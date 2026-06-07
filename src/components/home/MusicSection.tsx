import Image from "next/image";
import { ReleaseCard } from "@/components/music/ReleaseCard";
import { AudioPreview } from "@/components/music/AudioPreview";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { FEATURED_RELEASES, getLatestRelease } from "@/lib/music";
import { formatDate } from "@/lib/utils";

export function MusicSection() {
  const latest = getLatestRelease();
  const otherFeatured = FEATURED_RELEASES.filter(
    (r) => r.title !== latest.title
  );
  const listenUrl = latest.links.listen ?? latest.links.spotify;

  return (
    <section className="section-padding bg-warm-charcoal/40 grain-overlay">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          label="Listen"
          title="The Music"
          description="Let the work speak. Latest release and featured tracks — out now."
          align="center"
          className="mx-auto"
        />

        <div className="group mx-auto mb-10 max-w-xl overflow-hidden border border-muted-gold/25 bg-warm-charcoal/80 transition-colors hover:border-muted-gold/40">
          <div className="flex items-center gap-5 p-5 sm:gap-6 sm:p-6">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-near-black sm:h-32 sm:w-32">
              <Image
                src={latest.coverUrl}
                alt={`${latest.title} cover art`}
                width={128}
                height={128}
                unoptimized
                className="h-full w-full object-cover"
                priority
              />
              {latest.previewUrl && (
                <AudioPreview
                  previewUrl={latest.previewUrl}
                  title={latest.title}
                  overlay
                  className="!bottom-1.5 !right-1.5 !gap-1 !px-2 !py-1 !text-[9px]"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-gold">
                Latest Release
              </p>
              <h3 className="text-display mt-2 text-xl text-bone sm:text-2xl">
                {latest.title}
              </h3>
              <p className="mt-1 text-xs text-bone/50">
                {formatDate(latest.releaseDate)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-bone/70">
                The newest drop from the catalog — flip it, stream it, share it.
              </p>
              {listenUrl && (
                <a
                  href={listenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-[10px] uppercase tracking-widest text-muted-gold transition-colors hover:text-bone"
                >
                  Listen Now
                </a>
              )}
            </div>
          </div>
        </div>

        {otherFeatured.length > 0 && (
          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-6 sm:gap-8">
            {otherFeatured.map((release) => (
              <ReleaseCard key={release.title} release={release} compact />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button href="/music" variant="outline">
            Full Catalog
          </Button>
        </div>
      </div>
    </section>
  );
}
