import Image from "next/image";
import type { MerchColor, MerchProduct } from "@/config/merch.config";

/** Static 2D placement preview when Printful mockup photos aren't uploaded yet. */
export function MerchFlatMockup({
  product,
  color,
  className = "",
}: {
  product: MerchProduct;
  color: MerchColor;
  className?: string;
}) {
  const bg = color === "black" ? "bg-[#141416]" : "bg-[#f1f0ec]";
  const logoSrc =
    color === "white" ? "/merch/logo-chrome-outline.png" : "/merch/logo-chrome.png";
  const isShorts = product.slug === "booty-shorts";
  const isBack = product.logoPlacement === "back";

  return (
    <div
      className={`flex items-center justify-center p-8 ${bg} ${className}`}
      aria-label={`${product.name} mockup`}
    >
      <div className="relative w-full max-w-md">
        {isShorts ? (
          <div
            className={`relative mx-auto aspect-[3/4] w-[78%] rounded-t-[38%] rounded-b-3xl border-2 ${
              color === "black" ? "border-zinc-700" : "border-zinc-300"
            }`}
          >
            <div
              className={`absolute left-1/2 top-0 h-4 w-[90%] -translate-x-1/2 rounded-full ${
                color === "black" ? "bg-zinc-800" : "bg-zinc-200"
              }`}
            />
            <div className="absolute left-1/2 top-[36%] w-[58%] -translate-x-1/2 -translate-y-1/2">
              <Image
                src={logoSrc}
                alt=""
                width={600}
                height={200}
                className="h-auto w-full"
                unoptimized
              />
            </div>
            {isBack && (
              <span className="absolute left-3 top-7 text-[9px] tracking-[0.3em] text-zinc-500">
                BACK
              </span>
            )}
          </div>
        ) : (
          <div
            className={`relative mx-auto aspect-[4/5] w-[82%] rounded-3xl border-2 ${
              color === "black" ? "border-zinc-700" : "border-zinc-300"
            }`}
          >
            <span className="absolute left-3 top-5 text-[9px] tracking-[0.3em] text-zinc-500">
              FRONT
            </span>
            <div className="absolute left-1/2 top-[30%] w-[52%] -translate-x-1/2 -translate-y-1/2">
              <Image
                src={logoSrc}
                alt=""
                width={600}
                height={200}
                className="h-auto w-full"
                unoptimized
              />
            </div>
          </div>
        )}
        <p className="mt-4 text-center text-[10px] tracking-[0.25em] text-zinc-500">
          PRINTFUL MOCKUP PENDING
        </p>
      </div>
    </div>
  );
}
