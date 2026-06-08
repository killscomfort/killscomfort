"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LOGO_SRC, NAV_LINKS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CartLink } from "@/components/layout/CartLink";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLandingPage = pathname.startsWith("/lp");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLandingPage || isAdmin) return null;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-near-black/95 backdrop-blur-md border-b border-clay/20"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="block shrink-0">
          <Image
            src={LOGO_SRC}
            alt={SITE.name}
            width={180}
            height={40}
            className="h-8 w-auto sm:h-10"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.filter((link) => link.href !== "/book").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg text-bone/70 hover:text-muted-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <CartLink />
          <Button href="/book" size="sm">
            Book Me
          </Button>
        </nav>

        <button
          className="md:hidden text-bone"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-clay/20 bg-near-black/98 backdrop-blur-md">
          <nav className="flex flex-col gap-1 px-4 py-6">
            {NAV_LINKS.filter((link) => link.href !== "/book").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-2 py-3 text-lg text-bone/80 hover:text-muted-gold"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-2 py-3">
              <CartLink />
            </div>
            <Button href="/book" className="mt-4 w-full">
              Book Me
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
