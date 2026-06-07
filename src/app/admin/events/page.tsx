import Link from "next/link";

export default function AdminEventsPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-display text-3xl uppercase text-bone">Events</h1>
            <Link href="/admin" className="text-sm text-muted-gold hover:text-bone">
              ← Admin
            </Link>
          </div>
          <p className="mt-4 text-bone/60">
            Manage event galleries via Supabase or extend with upload forms.
            Events table supports title, venue, date, category, and image arrays.
          </p>
        </div>
      </section>
    </div>
  );
}
