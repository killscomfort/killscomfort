"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Users,
  FileText,
  Calendar,
  Music,
  Megaphone,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/music", label: "Music", icon: Music },
  { href: "/admin/landing-pages", label: "Landing Pages", icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-clay/20 bg-warm-charcoal">
      <div className="border-b border-clay/20 px-6 py-5">
        <Link href="/admin" className="block">
          <p className="text-display text-lg uppercase text-bone">{SITE.name}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-gold">
            Admin
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-muted-gold/15 text-muted-gold"
                  : "text-bone/60 hover:bg-near-black/50 hover:text-bone"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-clay/20 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-bone/60 hover:text-bone"
        >
          <ExternalLink size={18} />
          View Site
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-bone/60 hover:text-bone"
        >
          Account
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-bone/60 hover:text-dried-blood"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
