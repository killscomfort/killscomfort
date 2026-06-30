import { Hero } from "@/components/home/Hero";
import { RidePortal } from "@/components/home/RidePortal";
import { WhoIs } from "@/components/home/WhoIs";
import { WhatIDo } from "@/components/home/WhatIDo";
import { BookSection } from "@/components/home/BookSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RidePortal />
      <WhoIs />
      <WhatIDo />
      <BookSection />
    </>
  );
}
