"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Pause, Play, X } from "lucide-react";
import type { MusicRelease } from "@/lib/music";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function getListenUrl(release: MusicRelease) {
  return (
    release.links.listen ??
    release.links.spotify ??
    release.links.soundcloud ??
    release.links.appleMusic
  );
}

type MusicCarouselProps = {
  releases: MusicRelease[];
};

export function MusicCarousel({ releases }: MusicCarouselProps) {
  const [activeRelease, setActiveRelease] = useState<MusicRelease | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loop = [...releases, ...releases];

  const closeModal = useCallback(() => {
    audioRef.current?.pause();
    setActiveRelease(null);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!activeRelease?.previewUrl) return;

    setPlaying(true);
    const timer = window.setTimeout(() => {
      audioRef.current?.play().catch(() => setPlaying(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeRelease]);

  useEffect(() => {
    if (!activeRelease) return;

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeRelease, closeModal]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.play();
    setPlaying(true);
  }

  if (releases.length === 0) return null;

  return (
    <>
      <div className="music-carousel-mask relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
        <div className="music-marquee-track flex w-max gap-4 px-4 sm:gap-5 sm:px-6 lg:px-8">
          {loop.map((release, index) => (
            <button
              key={`${release.title}-${index}`}
              type="button"
              onClick={() => setActiveRelease(release)}
              className="group w-36 shrink-0 text-left sm:w-44"
            >
              <div className="relative aspect-square overflow-hidden border border-clay/20 bg-near-black transition-all duration-300 group-hover:-translate-y-1 group-hover:border-muted-gold/60 group-hover:shadow-[0_12px_40px_-12px_rgba(255,255,255,0.35)]">
                <Image
                  src={release.coverUrl}
                  alt={`${release.title} cover art`}
                  width={176}
                  height={176}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="176px"
                />
                <div className="absolute inset-0 bg-near-black/0 transition-colors duration-300 group-hover:bg-near-black/35" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/30 bg-near-black/80 text-bone backdrop-blur-sm">
                    <Play className="h-4 w-4 fill-current pl-0.5" />
                  </span>
                </div>
                {release.spotlight && (
                  <span className="absolute left-2 top-2 bg-muted-gold/90 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-near-black">
                    {release.spotlightLabel ?? "Spotlight"}
                  </span>
                )}
              </div>
              <p className="mt-2 truncate text-[11px] uppercase tracking-wide text-bone/80 transition-colors group-hover:text-muted-gold">
                {release.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {activeRelease && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Now playing ${activeRelease.title}`}
        >
          <button
            type="button"
            className="absolute inset-0 bg-near-black/85 backdrop-blur-sm"
            onClick={closeModal}
            aria-label="Close player"
          />

          <div className="relative z-10 w-full max-w-md border border-clay/30 bg-warm-charcoal p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 text-bone/50 transition-colors hover:text-bone"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto w-48 overflow-hidden border border-muted-gold/30 sm:w-56">
              <Image
                src={activeRelease.coverUrl}
                alt={`${activeRelease.title} cover art`}
                width={224}
                height={224}
                unoptimized
                className="aspect-square h-auto w-full object-cover"
              />
            </div>

            <div className="mt-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-gold">
                Now Playing
              </p>
              <h3 className="text-display mt-2 text-xl text-bone sm:text-2xl">
                {activeRelease.title}
              </h3>
              <p className="mt-1 text-xs text-bone/50">
                {formatDate(activeRelease.releaseDate)}
              </p>
            </div>

            {activeRelease.previewUrl ? (
              <>
                <audio
                  ref={audioRef}
                  src={activeRelease.previewUrl}
                  preload="auto"
                  onEnded={() => setPlaying(false)}
                  onPause={() => setPlaying(false)}
                  onPlay={() => setPlaying(true)}
                />
                <button
                  type="button"
                  onClick={togglePlay}
                  className={cn(
                    "mx-auto mt-6 flex items-center gap-2 border px-6 py-3 text-xs uppercase tracking-widest transition-colors",
                    playing
                      ? "border-muted-gold bg-muted-gold/10 text-muted-gold"
                      : "border-clay/40 text-bone hover:border-muted-gold hover:text-muted-gold"
                  )}
                >
                  {playing ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  {playing ? "Pause Preview" : "Play Preview"}
                </button>
              </>
            ) : (
              <p className="mt-6 text-center text-sm text-bone/50">
                Preview unavailable for this track.
              </p>
            )}

            {getListenUrl(activeRelease) && (
              <a
                href={getListenUrl(activeRelease)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-gold transition-colors hover:text-bone"
              >
                Listen Full Track
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
