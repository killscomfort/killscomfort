import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { KILLS_COMFORT_FONT } from "@/lib/fonts";

export const metadata = createMetadata({
  title: "Typeface",
  description: `Download the ${KILLS_COMFORT_FONT.family} display typeface for ${SITE.name} brand work.`,
  path: "/typeface",
});

const downloads = [
  {
    label: "TrueType (.ttf)",
    description: "Install on Mac or Windows — double-click, then Install Font.",
    href: KILLS_COMFORT_FONT.downloads.ttf,
    fileName: "KillsComfort.ttf",
  },
  {
    label: "Web Font (.woff2)",
    description: "Use in websites with @font-face or your CSS framework.",
    href: KILLS_COMFORT_FONT.downloads.woff2,
    fileName: "KillsComfort.woff2",
  },
  {
    label: "CSS Starter",
    description: "Drop-in @font-face rules and utility classes.",
    href: KILLS_COMFORT_FONT.downloads.css,
    fileName: "killscomfort-font.css",
  },
] as const;

export default function TypefacePage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-gold">
            Brand Assets
          </p>
          <h1 className="text-display mt-4 text-3xl uppercase text-bone sm:text-4xl">
            {KILLS_COMFORT_FONT.family} Typeface
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-bone/80">
            Custom display typeface for {SITE.name}. Share these files with
            collaborators working on flyers, merch, web, and video.
          </p>

          <dl className="mt-10 space-y-4 border border-bone/10 p-6 text-sm text-bone/70">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="uppercase tracking-wide text-bone/50">Version</dt>
              <dd>{KILLS_COMFORT_FONT.version}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="uppercase tracking-wide text-bone/50">Characters</dt>
              <dd>{KILLS_COMFORT_FONT.characters}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="uppercase tracking-wide text-bone/50">License</dt>
              <dd className="max-w-md text-right sm:text-right">
                {KILLS_COMFORT_FONT.license}
              </dd>
            </div>
          </dl>

          <div className="mt-10 space-y-4">
            {downloads.map((file) => (
              <a
                key={file.href}
                href={file.href}
                download={file.fileName}
                className="block border border-bone/15 p-5 transition hover:border-muted-gold/60 hover:bg-bone/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-display text-lg text-bone">{file.label}</p>
                    <p className="mt-2 text-sm text-bone/65">{file.description}</p>
                  </div>
                  <span className="shrink-0 text-sm uppercase tracking-wide text-muted-gold">
                    Download
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 border border-bone/10 p-6">
            <p className="text-display text-sm uppercase text-bone">Quick start</p>
            <pre className="mt-4 overflow-x-auto text-sm leading-relaxed text-bone/75">
{`@font-face {
  font-family: 'KillsComfort';
  src: url('/fonts/KillsComfort.woff2') format('woff2'),
       url('/fonts/KillsComfort.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.brand-lockup {
  font-family: 'KillsComfort', serif;
  letter-spacing: 0.05em;
}`}
            </pre>
          </div>

          <p className="mt-10 text-sm text-bone/50">
            Questions about usage?{" "}
            <Link href="/book" className="text-muted-gold underline-offset-4 hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
