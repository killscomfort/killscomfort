import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { NAV_LINKS, SITE, SOCIAL_LINKS } from "@/lib/constants";

type SocialIconProps = {
  className?: string;
};

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function SoundCloudIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M17.5 10.5c-.276 0-.5.224-.5.5v2c0 .276.224.5.5.5s.5-.224.5-.5v-2c0-.276-.224-.5-.5-.5zm-2-1c-.276 0-.5.224-.5.5v4c0 .276.224.5.5.5s.5-.224.5-.5v-4c0-.276-.224-.5-.5-.5zm-2-1c-.276 0-.5.224-.5.5v6c0 .276.224.5.5.5s.5-.224.5-.5v-6c0-.276-.224-.5-.5-.5zm-2-.5c-.276 0-.5.224-.5.5v7c0 .276.224.5.5.5s.5-.224.5-.5v-7c0-.276-.224-.5-.5-.5zm-2-1c-.276 0-.5.224-.5.5v9c0 .276.224.5.5.5s.5-.224.5-.5v-9c0-.276-.224-.5-.5-.5zM7 6.5c-.276 0-.5.224-.5.5v10c0 .276.224.5.5.5s.5-.224.5-.5V7c0-.276-.224-.5-.5-.5zM4.5 8c-.276 0-.5.224-.5.5v7c0 .276.224.5.5.5s.5-.224.5-.5v-7c0-.276-.224-.5-.5-.5zM2 9.5c-.276 0-.5.224-.5.5v4c0 .276.224.5.5.5s.5-.224.5-.5v-4c0-.276-.224-.5-.5-.5zm17.5-.5c-1.933 0-3.68.832-4.896 2.16C13.68 9.832 11.933 9 10 9 6.134 9 3 12.134 3 16h18c0-3.866-3.134-7-7-7z" />
    </svg>
  );
}

function SpotifyIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.303a.747.747 0 01-1.035.26c-2.844-1.737-6.419-2.13-10.633-1.168a.75.75 0 11-.335-1.462c4.607-1.05 8.625-.604 11.785 1.523.36.22.472.688.218 1.047zm1.475-3.305a.934.934 0 01-1.286.312c-3.255-1.984-8.213-2.56-12.066-1.401a.935.935 0 11-.548-1.787c4.493-1.313 10.075-.667 13.886 1.686.44.268.58.842.014 1.19zm.127-3.441c-3.707-2.2-9.822-2.404-13.366-1.324a1.12 1.12 0 11-.645-2.145c4.064-1.23 10.893-.987 15.216 1.566a1.12 1.12 0 01-1.205 1.903z" />
    </svg>
  );
}

function AppleMusicIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M17.05 1.277c.96.107 1.777.66 2.242 1.456.297.51.436 1.09.436 1.706v14.112c0 1.38-1.12 2.5-2.5 2.5h-9.476c-1.38 0-2.5-1.12-2.5-2.5V4.439c0-.616.139-1.196.436-1.706.465-.796 1.282-1.349 2.242-1.456L12.5.723l4.55.554zM12 3.05l-3.2.39v11.06c0 .69.56 1.25 1.25 1.25s1.25-.56 1.25-1.25V8.9l1.7-.207v5.807c0 .69.56 1.25 1.25 1.25s1.25-.56 1.25-1.25V3.05H12z" />
    </svg>
  );
}

function DeezerIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.81 4.16v3.03h3.03V4.16h-3.03zm-4.53 0v3.03h3.03V4.16h-3.03zm-4.54 0v3.03h3.04V4.16H9.74zm-4.53 0v3.03h3.03V4.16H5.21zm13.06 4.54v3.03h3.03V8.7h-3.03zm-4.53 0v3.03h3.03V8.7h-3.03zm-4.54 0v3.03h3.04V8.7H9.74zm-4.53 0v3.03h3.03V8.7H5.21zm13.06 4.53v3.04h3.03v-3.04h-3.03zm-4.53 0v3.04h3.03v-3.04h-3.03zm-4.54 0v3.04h3.04v-3.04H9.74zm-4.53 0v3.04h3.03v-3.04H5.21z" />
    </svg>
  );
}

const CONNECT_LINKS = [
  { href: SOCIAL_LINKS.instagram, label: "Instagram", Icon: InstagramIcon, external: true },
  { href: SOCIAL_LINKS.soundcloud, label: "SoundCloud", Icon: SoundCloudIcon, external: true },
  { href: SOCIAL_LINKS.spotify, label: "Spotify", Icon: SpotifyIcon, external: true },
  { href: SOCIAL_LINKS.appleMusic, label: "Apple Music", Icon: AppleMusicIcon, external: true },
  { href: SOCIAL_LINKS.deezer, label: "Deezer", Icon: DeezerIcon, external: true },
  { href: `mailto:${SITE.email}`, label: "Email", Icon: Mail, external: false },
] as const;

const iconLinkClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-clay/30 text-bone/70 transition-colors hover:border-muted-gold hover:text-muted-gold";

export function Footer() {
  return (
    <footer className="border-t border-clay/20 bg-warm-charcoal grain-overlay">
      <div className="relative mx-auto max-w-7xl section-padding !pb-10 !pt-14">
        <div className="grid gap-10 border-b border-clay/10 pb-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] lg:gap-12">
          <div className="max-w-sm">
            <p className="text-2xl font-normal normal-case tracking-normal text-bone sm:text-3xl">
              {SITE.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-bone/70 sm:text-base">
              {SITE.tagline}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-bone/45">
              <MapPin className="h-3.5 w-3.5 text-muted-gold" aria-hidden />
              Miami Area
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-gold">
              Navigate
            </p>
            <nav className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-bone/70 transition-colors hover:text-muted-gold"
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
            <div className="flex flex-wrap items-center gap-2.5">
              {CONNECT_LINKS.map(({ href, label, Icon, external = true }) =>
                external ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={iconLinkClass}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ) : (
                  <a key={label} href={href} aria-label={label} className={iconLinkClass}>
                    <Icon className="h-4 w-4" />
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-bone/40">
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
