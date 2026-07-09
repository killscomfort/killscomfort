"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/newsletter", label: "Subscribers", exact: true },
  { href: "/admin/newsletter/drafts", label: "Drafts" },
];

export function NewsletterAdminTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TABS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-widest transition-colors",
              active
                ? "bg-muted-gold text-near-black"
                : "border border-clay/30 text-bone/60 hover:text-bone"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
