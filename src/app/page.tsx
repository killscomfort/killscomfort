import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Headphones, ShoppingBag, Sparkles } from "lucide-react";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";
import { MerchShop } from "@/components/merch/MerchShop";
import { ReleaseCard } from "@/components/music/ReleaseCard";
import { MinimalDonateCard } from "@/components/home/MinimalDonateCard";
import { Button } from "@/components/ui/Button";
import { MERCH_ITEMS } from "@/lib/merch";
import { FEATURED_RELEASES, SOUNDCLOUD_MIXES, getSpotlightRelease } from "@/lib/music";
import { SITE, SOCIAL_LINKS } from "@/lib/constants";

export default function HomePage() {
  const featured = getSpotlightRelease();
  const musicGrid = [...FEATURED_RELEASES, ...SOUNDCLOUD_MIXES].slice(0, 6);

  return (
    <div className="pb-24 pt-28 sm:pt-32">
      <section className="section-shell">
        <div className="glass-panel overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-near-black/45">
                Miami DJ · producer · sound engineer
              </p>
              <h1 className="mt-5 max-w-4xl text-display text-6xl uppercase text-near-black sm:text-7xl lg:text-[7rem]">
                Minimal energy.
                <span className="block text-burnt-sienna">Maximum presence.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-near-black/68 sm:text-lg">
                {SITE.name} is Gregory Tovar&apos;s home for sound, culture, and clean
                execution. This rebuilt one-pager keeps everything essential in one
                place: hear the music, shop the merch, support the movement, and book
                the next experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="#book" size="lg">
                  Book KillsComfort
                </Button>
                <Button href="#music" variant="secondary" size="lg">
                  Hear the work
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  "One clean scroll for music, merch, support, and booking.",
                  "Existing inquiry, newsletter, donation, and checkout flows stay intact.",
                  "Built to feel softer, lighter, and easier to navigate on mobile.",
                ].map((line) => (
                  <div
                    key={line}
                    className="rounded-[1.5rem] border border-clay/70 bg-bone/70 px-4 py-4 text-sm leading-relaxed text-near-black/65"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-clay/70 bg-[#e8dcc7]">
                <Image
                  src="/about/FINALS-60.png"
                  alt="KillsComfort performing live"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#221d17]/18 via-transparent to-[#fffdf7]/16" />
              </div>

              {featured ? (
                <div className="rounded-[1.75rem] border border-clay/70 bg-[#f3e8d7] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-near-black/45">
                    Current spotlight
                  </p>
                  <div className="mt-3 flex items-start gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-clay/70">
                      <Image
                        src={featured.coverUrl}
                        alt={`${featured.title} cover`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-medium text-near-black">{featured.title}</p>
                      <p className="mt-1 text-sm text-near-black/60">
                        Fresh release, direct links, and built-in preview controls below.
                      </p>
                      <a
                        href={
                          featured.links.listen ??
                          featured.links.spotify ??
                          featured.links.soundcloud ??
                          featured.links.appleMusic
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-near-black/70 transition-colors hover:text-near-black"
                      >
                        Open release
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-near-black/45">
              What this is
            </p>
            <h2 className="mt-4 text-display text-5xl uppercase text-near-black sm:text-6xl">
              A calmer front end with the same engine underneath.
            </h2>
          </div>
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-base leading-relaxed text-near-black/68">
              The site now leads with space, warmth, and clarity instead of a busy UI.
              Gregory&apos;s story, current music, merch, support, and booking all live in
              one flow while the backend integrations keep handling inquiries, cart state,
              Stripe checkout, newsletter capture, and email follow-ups.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Bookings", value: "Inquiry form + email flow" },
                { label: "Merch", value: `${MERCH_ITEMS.length} active products` },
                { label: "Music", value: "Preview + platform links" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-clay/70 bg-desert-sand/65 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-near-black/45">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm text-near-black/70">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="music" className="section-shell mt-8">
        <div className="glass-panel p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-near-black/45">
                Sound first
              </p>
              <h2 className="mt-4 text-display text-5xl uppercase text-near-black sm:text-6xl">
                Hear the movement.
              </h2>
              <p className="mt-3 max-w-2xl text-near-black/66">
                Featured releases, current flips, and fast access to every major platform.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SOCIAL_LINKS).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-clay/70 bg-bone/70 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-near-black/70 transition-colors hover:border-near-black hover:text-near-black"
                >
                  {platform === "appleMusic"
                    ? "Apple Music"
                    : platform === "soundcloud"
                      ? "SoundCloud"
                      : platform === "youtube"
                        ? "YouTube"
                        : platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {musicGrid.map((release) => (
              <ReleaseCard key={`${release.title}-${release.releaseDate}`} release={release} />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/music" variant="outline">
              Full catalog
            </Button>
            <Button href="/events" variant="ghost">
              Live sets and events
            </Button>
          </div>
        </div>
      </section>

      <section id="merch" className="section-shell mt-8">
        <div className="glass-panel p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-near-black/45">
                Shop
              </p>
              <h2 className="mt-4 text-display text-5xl uppercase text-near-black sm:text-6xl">
                Merch without the clutter.
              </h2>
              <p className="mt-3 max-w-2xl text-near-black/66">
                Clean product cards, preserved cart state, and the same checkout flow already
                wired to Stripe.
              </p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-near-black/65 transition-colors hover:text-near-black"
            >
              Go to cart
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            <MerchShop />
          </div>
        </div>
      </section>

      <section id="support" className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-near-black/45">
              Support the work
            </p>
            <h2 className="mt-4 text-display text-5xl uppercase text-near-black sm:text-6xl">
              Fuel the next release.
            </h2>
            <p className="mt-4 max-w-xl text-near-black/66">
              Donations still route through the same Stripe checkout flow, now presented in a
              lighter section that feels native to the page.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Headphones,
                  title: "Production",
                  body: "Studio time, engineering, and release-ready sound.",
                },
                {
                  icon: Sparkles,
                  title: "Rollout",
                  body: "Creative tools, product iteration, and community infrastructure.",
                },
                {
                  icon: ArrowUpRight,
                  title: "Experiences",
                  body: "Live sets, visuals, and the next room-changing moment.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-clay/70 bg-desert-sand/65 p-4"
                >
                  <Icon className="h-5 w-5 text-burnt-sienna" />
                  <p className="mt-3 text-sm font-medium uppercase tracking-[0.14em] text-near-black">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-near-black/65">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <MinimalDonateCard />
        </div>
      </section>

      <section id="book" className="section-shell mt-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-near-black/45">
              Stay connected
            </p>
            <h2 className="mt-4 text-display text-5xl uppercase text-near-black sm:text-6xl">
              Keep up with the drops.
            </h2>
            <p className="mt-3 text-near-black/66">
              Newsletter signup is still powered by the existing backend, including source and
              UTM capture.
            </p>
            <div className="mt-6">
              <Suspense fallback={null}>
                <NewsletterSignup source="home" />
              </Suspense>
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-near-black/45">
              Booking
            </p>
            <h2 className="mt-4 text-display text-5xl uppercase text-near-black sm:text-6xl">
              Let&apos;s build the room.
            </h2>
            <p className="mt-3 max-w-xl text-near-black/66">
              The inquiry pipeline stays intact: submissions are validated, saved, emailed,
              and ready for Gregory to follow up.
            </p>
            <div className="mt-8">
              <Suspense fallback={null}>
                <InquiryForm source="one-page-home" />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
