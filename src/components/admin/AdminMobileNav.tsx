"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/music", label: "Music" },
  { href: "/admin/landing-pages", label: "Landing" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 -mx-4 overflow-x-auto border-b border-clay/20 px-4 pb-3 lg:hidden">
      <div className="flex min-w-max gap-1">
        {TABS.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap px-3 py-2 text-xs uppercase tracking-widest transition-colors",
                active
                  ? "bg-muted-gold text-near-black"
                  : "text-bone/60 hover:text-bone"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
