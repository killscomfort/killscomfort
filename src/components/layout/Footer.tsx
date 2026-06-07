import Link from "next/link";
import { NAV_LINKS, SITE, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-clay/20 bg-warm-charcoal grain-overlay">
      <div className="relative mx-auto max-w-7xl section-padding">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="text-2xl font-normal normal-case tracking-normal text-bone sm:text-3xl">
              {SITE.name}
            </p>
            <p className="mt-3 text-sm font-normal normal-case leading-relaxed tracking-normal text-bone/70 sm:text-base">
              {SITE.tagline}
            </p>
            <p className="mt-2 text-sm font-normal normal-case text-bone/40">
              {SITE.location}
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-gold">
              Navigate
            </p>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-gold">
              Connect
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
              >
                Instagram
              </a>
              <a
                href={SOCIAL_LINKS.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
              >
                SoundCloud
              </a>
              <a
                href={SOCIAL_LINKS.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
              >
                Spotify
              </a>
              <a
                href={SOCIAL_LINKS.appleMusic}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
              >
                Apple Music
              </a>
              <a
                href={SOCIAL_LINKS.deezer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
              >
                Deezer
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="text-sm text-bone/70 hover:text-muted-gold transition-colors"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-clay/10 pt-8 text-center text-xs text-bone/40">
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
