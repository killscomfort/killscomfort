import Link from "next/link";

export default function AdminMusicPage() {
  return (
    <div className="pt-24">
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-display text-3xl uppercase text-bone">Music</h1>
            <Link href="/admin" className="text-sm text-muted-gold hover:text-bone">
              ← Admin
            </Link>
          </div>
          <p className="mt-4 text-bone/60">
            Add SoundCloud, Spotify, and Beatport embed URLs. Music entries
            support categories: dj_mix, original, remix.
          </p>
        </div>
      </section>
    </div>
  );
}
