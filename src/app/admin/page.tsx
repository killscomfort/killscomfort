import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: inquiryCount },
    { count: newInquiryCount },
    { count: userCount },
    { count: postCount },
  ] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Inquiries", value: inquiryCount ?? 0, href: "/admin/inquiries" },
    { label: "New Inquiries", value: newInquiryCount ?? 0, href: "/admin/inquiries?status=new" },
    { label: "Registered Users", value: userCount ?? 0, href: "/admin/users" },
    { label: "Blog Posts", value: postCount ?? 0, href: "/admin/blog" },
  ];

  const sections = [
    { title: "Inquiries", href: "/admin/inquiries", desc: "View and manage booking requests" },
    { title: "Blog", href: "/admin/blog", desc: "Create and edit journal posts" },
    { title: "Events", href: "/admin/events", desc: "Manage gallery and past events" },
    { title: "Music", href: "/admin/music", desc: "Upload music links and embeds" },
    { title: "Landing Pages", href: "/admin/landing-pages", desc: "Manage ad campaign pages" },
    { title: "Users", href: "/admin/users", desc: "View registered users" },
  ];

  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-display text-4xl uppercase text-bone">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-bone/60">Manage your site content and inquiries.</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="border border-clay/20 bg-warm-charcoal/50 p-6 transition-colors hover:border-muted-gold/40"
              >
                <p className="text-display text-4xl text-muted-gold">{stat.value}</p>
                <p className="mt-2 text-sm text-bone/60">{stat.label}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="border border-clay/20 p-6 transition-all hover:-translate-y-0.5 hover:border-burnt-sienna/40"
              >
                <h2 className="text-display text-xl uppercase text-bone">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-bone/60">{section.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
