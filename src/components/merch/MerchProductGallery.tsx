"use client";

import Image from "next/image";
import type { MerchColor, MerchProduct } from "@/config/merch.config";
import { MerchFlatMockup } from "@/components/merch/MerchFlatMockup";

export function merchGalleryFor(product: MerchProduct, color: MerchColor): string[] {
  return product.gallery?.[color] ?? [];
}

export default function MerchProductGallery({
  product,
  color,
  className = "",
  priority = false,
}: {
  product: MerchProduct;
  color: MerchColor;
  className?: string;
  priority?: boolean;
}) {
  const images = merchGalleryFor(product, color);

  if (images.length > 0) {
    return (
      <div className={`relative overflow-hidden bg-[#0b0b0d] ${className}`}>
        {images.length === 1 ? (
          <Image
            src={images[0]}
            alt={`${product.name} — ${color}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <div key={src} className="relative h-full min-w-full shrink-0 snap-center">
                <Image
                  src={src}
                  alt={`${product.name} — ${color}, view ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={priority && i === 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <MerchFlatMockup
      product={product}
      color={color}
      className={className}
    />
  );
}
