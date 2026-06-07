"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ABOUT_GALLERY_IMAGES } from "@/lib/about";

const galleryImages = ABOUT_GALLERY_IMAGES.slice(0, 6);

export function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="section-padding bg-warm-charcoal grain-overlay">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          label="Experience"
          title="Past Events"
          description="Moody, atmospheric — show, don't tell."
          align="center"
          className="mx-auto"
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {galleryImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setLightbox(src)}
              className="group relative aspect-square overflow-hidden"
            >
              <Image
                src={src}
                alt={`Event photo ${i + 1}`}
                fill
                className="object-cover grayscale contrast-125 transition-all duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-near-black/20 transition-opacity group-hover:opacity-0" />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-near-black/95 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 text-bone"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={lightbox}
              alt="Event photo"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
