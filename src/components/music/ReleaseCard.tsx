import Image from "next/image";
import type { MusicRelease } from "@/lib/music";
import { AudioPreview } from "./AudioPreview";

type ReleaseCardProps = {
  release: MusicRelease;
  compact?: boolean;
};

export function ReleaseCard({ release, compact = false }: ReleaseCardProps) {
  const listenUrl =
    release.links.listen ??
    release.links.spotify ??
    release.links.soundcloud ??
    release.links.appleMusic;

  return (
    <article className={compact ? "mx-auto w-full max-w-[9.5rem]" : "group"}>
      <div className="relative aspect-square overflow-hidden bg-near-black">
        <Image
          src={release.coverUrl}
          alt={`${release.title} cover art`}
          width={compact ? 152 : 400}
          height={compact ? 152 : 400}
          unoptimized={compact}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes={
            compact
              ? "152px"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          quality={90}
        />
        {release.previewUrl && (
          <AudioPreview
            previewUrl={release.previewUrl}
            title={release.title}
            overlay
            className="!bottom-2 !right-2 !gap-1 !px-2 !py-1 !text-[9px]"
          />
        )}
      </div>

      {listenUrl && (
        <a
          href={listenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block uppercase tracking-widest text-bone/75 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-muted-gold hover:decoration-muted-gold ${
            compact
              ? "mt-2 text-[10px]"
              : "mt-4 text-[11px]"
          }`}
        >
          Listen now
        </a>
      )}

      <h4
        className={`uppercase leading-snug tracking-wide text-bone ${
          compact ? "mt-2 text-[10px]" : "mt-3 text-[11px]"
        }`}
      >
        {release.title}
      </h4>
    </article>
  );
}
