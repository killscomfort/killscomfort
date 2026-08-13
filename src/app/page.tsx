import FeaturedRelease from "@/components/FeaturedRelease";
import { Hero } from "@/components/home/Hero";
import { IntroExperience } from "@/components/home/IntroExperience";
import { WhoIs } from "@/components/home/WhoIs";
import { WhatIDo } from "@/components/home/WhatIDo";
import { BookSection } from "@/components/home/BookSection";
import { getSpotlightRelease } from "@/lib/music";

export default function HomePage() {
  const featured = getSpotlightRelease();

  return (
    <>
      <IntroExperience />
      <div id="main-site">
        <Hero />
        {featured && <FeaturedRelease release={featured} />}
        <WhoIs />
        <WhatIDo />
        <BookSection />
      </div>
    </>
  );
}
