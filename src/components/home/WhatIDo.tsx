import { Disc3, Headphones, Sparkles } from "lucide-react";
import { BrandText } from "@/components/ui/BrandText";
import { SectionHeading } from "@/components/ui/SectionHeading";

const offerings = [
  {
    icon: Disc3,
    title: "DJ Sets",
    description:
      "Versatile, high-energy sets for clubs, festivals, and private events. House, techno, hip-hop — built to read the room and move the crowd.",
  },
  {
    icon: Headphones,
    title: "Production",
    description:
      "Original tracks, remixes, and sonic branding. Music that carries the grit of the streets with the polish of experience.",
  },
  {
    icon: Sparkles,
    title: "Event Curation",
    description:
      "End-to-end creative direction — vibe, sound, energy. Events that feel intentional, not manufactured.",
  },
];

export function WhatIDo() {
  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Services"
          title="What I Do"
          description="Three lanes. One mission — create experiences that connect."
          align="center"
          className="mx-auto"
        />

        <div className="grid gap-8 md:grid-cols-3">
          {offerings.map((item) => (
            <div
              key={item.title}
              className="group border border-clay/20 bg-warm-charcoal/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-muted-gold/40"
            >
              <item.icon className="mb-6 h-10 w-10 text-muted-gold transition-colors group-hover:text-desert-sand" />
              <h3 className="text-2xl text-bone">
                <BrandText variant="title" as="span">
                  {item.title}
                </BrandText>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-bone/60">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
