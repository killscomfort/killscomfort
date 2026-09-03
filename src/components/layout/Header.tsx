"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { isAcademyPath, isImmersiveLandPath, isRidePath } from "@/lib/ride-games";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CartLink } from "@/components/layout/CartLink";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLandingPage = pathname.startsWith("/lp") || isImmersiveLandPath(pathname);
  const isAdmin = pathname.startsWith("/admin");
  const isRide = isRidePath(pathname);
  const isAcademy = isAcademyPath(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLandingPage || isAdmin || isRide || isAcademy) return null;

  const ctaHref = pathname === "/" ? "#book" : "/#book";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-clay/60 bg-bone/80 shadow-[0_12px_36px_rgba(34,29,23,0.06)] backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="section-shell flex items-center justify-between py-4">
          <Link href="/" className="block shrink-0">
            <p className="text-display text-3xl tracking-[0.12em] text-near-black sm:text-4xl">
              {SITE.name}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-near-black/55">
              Miami · Music · Movement
            </p>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-[0.16em] text-near-black/60 transition-colors hover:text-near-black"
              >
                {link.label}
              </Link>
            ))}
            <CartLink />
            <Button href={ctaHref} size="sm">
              Book now
            </Button>
          </nav>

          <button
            className="rounded-full border border-clay/60 bg-bone/80 p-2 text-near-black md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-clay/60 bg-bone/95 shadow-[0_18px_40px_rgba(34,29,23,0.08)] backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-2 py-3 text-sm uppercase tracking-[0.16em] text-near-black/70"
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-2 py-3">
                <CartLink />
              </div>
              <div className="mt-4">
                <Button href={ctaHref} className="w-full">
                  Book now
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
