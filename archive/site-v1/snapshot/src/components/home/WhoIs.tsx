import Image from "next/image";
import { BrandText } from "@/components/ui/BrandText";
import { HOME_ARTIST_IMAGE, FOUNDER_INTRO } from "@/lib/about";
import { SITE } from "@/lib/constants";

export function WhoIs() {
  return (
    <section className="section-padding !py-14 lg:!py-20 bg-near-black">
      <div className="relative mx-auto max-w-lg lg:max-w-xl">
        <div className="relative overflow-hidden">
          <Image
            src={HOME_ARTIST_IMAGE}
            alt={`${SITE.founder} — ${SITE.name}`}
            width={819}
            height={1024}
            className="h-auto w-full"
            sizes="(max-width: 1280px) 100vw, 512px"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/70 to-near-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-near-black/50 via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <h2 className="text-3xl leading-none text-bone sm:text-4xl lg:text-5xl">
              <BrandText variant="title" as="span">
                Hi, I&apos;m {SITE.name}
              </BrandText>
            </h2>
            <p className="mt-4 max-w-xl border-l-2 border-muted-gold/50 pl-4 text-sm leading-relaxed text-bone/85 sm:max-w-2xl sm:text-base">
              {FOUNDER_INTRO}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
