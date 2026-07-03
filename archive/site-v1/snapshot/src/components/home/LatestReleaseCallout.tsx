"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { AudioPreview } from "@/components/music/AudioPreview";
import type { MusicRelease } from "@/lib/music";
import { formatDate } from "@/lib/utils";

type LatestReleaseCalloutProps = {
  release: MusicRelease;
};

export function LatestReleaseCallout({ release }: LatestReleaseCalloutProps) {
  const listenUrl = release.links.listen ?? release.links.spotify;
  if (!listenUrl) return null;

  return (
    <div className="mx-auto mt-10 max-w-md border border-clay/25 bg-near-black/70 px-4 py-3 sm:max-w-lg sm:px-5">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-near-black ring-1 ring-bone/10">
          <Image
            src={release.coverUrl}
            alt={`${release.title} cover art`}
            width={56}
            height={56}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-gold">
            Out Now &middot; {formatDate(release.releaseDate)}
          </p>
          <p className="mt-1 truncate text-lg text-bone sm:text-xl">
            {release.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={listenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-bone/80 transition-colors hover:text-muted-gold"
            >
              Listen
              <ExternalLink className="h-3 w-3" />
            </a>
            {release.previewUrl && (
              <AudioPreview
                previewUrl={release.previewUrl}
                title={release.title}
                className="!border-clay/25 !px-3 !py-1.5 !text-[10px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
