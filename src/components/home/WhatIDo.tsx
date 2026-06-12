import { Disc3, GraduationCap, Headphones, Sparkles } from "lucide-react";
import { BrandText } from "@/components/ui/BrandText";
import { SectionHeading } from "@/components/ui/SectionHeading";

const offerings = [
  {
    icon: Disc3,
    title: "DJ Sets",
    description:
      "High-energy sets for clubs, festivals, and private events — house, techno, hip-hop.",
  },
  {
    icon: Headphones,
    title: "Production & Sound",
    description:
      "Tracks, remixes, sonic branding, and sound engineering — SAE-trained, street-tested.",
  },
  {
    icon: Sparkles,
    title: "Event Curation",
    description:
      "Creative direction for vibe, sound, and energy — events that feel intentional.",
  },
  {
    icon: GraduationCap,
    title: "Private Lessons",
    description:
      "One-on-one DJ, production, or sound engineering — personalized coaching in the booth or studio.",
  },
];

export function WhatIDo() {
  return (
    <section className="section-padding !py-14 lg:!py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="What I Do"
          description="Four lanes. One mission — create experiences that connect."
          align="center"
          className="mx-auto mb-8"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {offerings.map((item) => (
            <div
              key={item.title}
              className="group border border-clay/20 bg-warm-charcoal/50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-muted-gold/40 sm:p-5"
            >
              <item.icon className="mb-2 h-6 w-6 text-muted-gold transition-colors group-hover:text-desert-sand sm:mb-3 sm:h-8 sm:w-8" />
              <h3 className="text-base text-bone sm:text-xl">
                <BrandText variant="title" as="span">
                  {item.title}
                </BrandText>
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-bone/60 sm:mt-2 sm:text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
