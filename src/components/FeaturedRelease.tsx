"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { AudioPreview } from "@/components/music/AudioPreview";
import type { MusicRelease } from "@/lib/music";
import { formatDate } from "@/lib/utils";

type FeaturedReleaseProps = {
  release: MusicRelease;
};

export default function FeaturedRelease({ release }: FeaturedReleaseProps) {
  const listenUrl =
    release.links.listen ??
    release.links.spotify ??
    release.links.soundcloud ??
    release.links.appleMusic;

  return (
    <section
      id="featured-release"
      className="relative overflow-hidden border-y border-clay/20 bg-near-black"
      aria-label={`Featured release: ${release.title}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(201,162,39,0.08),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="relative mx-auto aspect-square w-full max-w-[14rem] overflow-hidden bg-near-black ring-1 ring-bone/15">
          <Image
            src={release.coverUrl}
            alt={`${release.title} cover art`}
            fill
            unoptimized
            className="object-cover"
            sizes="224px"
            priority
          />
        </div>

        <div className="text-center sm:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-gold">
            {release.spotlightLabel ?? "Out Now"}
            <span className="text-bone/40"> · </span>
            {formatDate(release.releaseDate)}
          </p>

          <h2 className="mt-3 text-3xl uppercase leading-none tracking-wide text-bone sm:text-4xl lg:text-5xl">
            {release.title}
          </h2>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            {listenUrl ? (
              <a
                href={listenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-muted-gold/60 bg-muted-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-muted-gold transition-colors hover:bg-muted-gold hover:text-near-black"
              >
                Listen
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <a
                href="/music"
                className="inline-flex items-center gap-2 border border-clay/40 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-bone/80 transition-colors hover:border-muted-gold hover:text-muted-gold"
              >
                View on Music
              </a>
            )}

            {release.previewUrl && (
              <AudioPreview
                previewUrl={release.previewUrl}
                title={release.title}
                className="!border-clay/30 !px-4 !py-2 !text-[10px]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
