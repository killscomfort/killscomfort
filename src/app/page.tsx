import FeaturedRelease from "@/components/FeaturedRelease";
import { Hero } from "@/components/home/Hero";
import { WhoIs } from "@/components/home/WhoIs";
import { WhatIDo } from "@/components/home/WhatIDo";
import { BookSection } from "@/components/home/BookSection";
import { getSpotlightRelease } from "@/lib/music";

export default function HomePage() {
  const featured = getSpotlightRelease();

  return (
    <>
      <Hero />
      {featured && <FeaturedRelease release={featured} />}
      <WhoIs />
      <WhatIDo />
      <BookSection />
    </>
  );
}
