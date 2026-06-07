import { Hero } from "@/components/home/Hero";
import { WhoIs } from "@/components/home/WhoIs";
import { WhatIDo } from "@/components/home/WhatIDo";
import { MusicSection } from "@/components/home/MusicSection";
import { Gallery } from "@/components/home/Gallery";
import { BookSection } from "@/components/home/BookSection";
import { getLatestRelease } from "@/lib/music";

export default function HomePage() {
  const latestRelease = getLatestRelease();

  return (
    <>
      <Hero latestRelease={latestRelease} />
      <MusicSection />
      <WhoIs />
      <WhatIDo />
      <Gallery />
      <BookSection />
    </>
  );
}
