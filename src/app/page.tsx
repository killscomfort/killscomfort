import { Hero } from "@/components/home/Hero";
import { HomeGameEntry } from "@/components/home/HomeGameEntry";
import { WhoIs } from "@/components/home/WhoIs";
import { WhatIDo } from "@/components/home/WhatIDo";
import { BookSection } from "@/components/home/BookSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeGameEntry />
      <WhoIs />
      <WhatIDo />
      <BookSection />
    </>
  );
}
