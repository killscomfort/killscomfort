"use client";

import { MusicCarousel } from "@/components/home/MusicCarousel";
import { MUSIC_RELEASES } from "@/lib/music";

const carouselReleases = [...MUSIC_RELEASES]
  .filter((release) => release.previewUrl)
  .sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

export function HeroMusic() {
  return <MusicCarousel releases={carouselReleases} />;
}
