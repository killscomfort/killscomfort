import { ReleaseCard } from "@/components/music/ReleaseCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE, SOCIAL_LINKS } from "@/lib/constants";
import {
  STREAMING_PROFILES,
  releasesByCategory,
  remixReleases,
} from "@/lib/music";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Music",
  description: `Original productions and remixes from ${SITE.name}.`,
  path: "/music",
});

const categories = [
  {
    name: "Original Productions",
    description: null,
    profileHref: null,
    releases: releasesByCategory("original"),
  },
  {
    name: "Remixes",
    description: "Edits, flips, and exclusives — including SoundCloud releases.",
    profileHref: STREAMING_PROFILES.soundcloud,
    releases: remixReleases(),
  },
];

export default function MusicPage() {
  return (
    <div className="pt-28 pb-24">
      <section className="section-shell">
        <div className="glass-panel mx-auto max-w-5xl p-6 sm:p-10">
          <SectionHeading
            title="The Music"
            description="Hear the range. Feel the energy."
          />

          <div className="mb-10 flex flex-wrap gap-3">
            {Object.entries(SOCIAL_LINKS).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-clay/70 px-3 py-1.5 text-[10px] uppercase tracking-widest text-near-black/70 hover:border-near-black hover:text-near-black transition-colors"
              >
                {platform === "appleMusic"
                  ? "Apple Music"
                  : platform === "soundcloud"
                    ? "SoundCloud"
                    : platform === "youtube"
                      ? "YouTube"
                      : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>

          {categories.map((cat) => (
            <div key={cat.name} className="mb-14">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-display text-xl uppercase text-near-black sm:text-2xl">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-1.5 text-xs text-near-black/60">{cat.description}</p>
                  )}
                </div>
                {cat.profileHref && (
                  <a
                    href={cat.profileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-near-black/65 hover:text-near-black transition-colors"
                  >
                    Full SoundCloud Profile →
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-12">
                {cat.releases.map((release) => (
                  <ReleaseCard key={release.title} release={release} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
