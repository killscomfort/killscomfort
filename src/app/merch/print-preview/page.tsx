import Image from "next/image";
import Link from "next/link";

/** Flat mockups for Printful placement — upload files from /print-files/ */

function PlacementCard({
  title,
  placement,
  color,
  garment,
  logoSrc,
}: {
  title: string;
  placement: string;
  color: "black" | "white";
  garment: "shorts" | "shirt";
  logoSrc: string;
}) {
  const bg = color === "black" ? "bg-[#141416]" : "bg-[#f1f0ec]";
  const label = color === "black" ? "Black garment" : "White garment";
  const isBack = placement === "back";

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#101014]">
      <div className="border-b border-zinc-800 px-5 py-3">
        <p className="text-xs tracking-[0.3em] text-zinc-500">{label.toUpperCase()}</p>
        <h2 className="mt-1 font-bold uppercase tracking-wide text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Logo on <span className="text-zinc-300">{placement}</span>
        </p>
      </div>

      <div className={`relative mx-auto aspect-[3/4] max-w-sm ${bg}`}>
        {/* garment silhouette */}
        {garment === "shorts" ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div
              className={`relative h-[72%] w-[88%] rounded-t-[40%] rounded-b-3xl border-2 ${
                color === "black" ? "border-zinc-700" : "border-zinc-300"
              }`}
            >
              <div
                className={`absolute left-1/2 top-0 h-5 w-[92%] -translate-x-1/2 rounded-full ${
                  color === "black" ? "bg-zinc-800" : "bg-zinc-200"
                }`}
              />
              {/* back label */}
              {isBack && (
                <span className="absolute left-3 top-8 text-[10px] tracking-[0.25em] text-zinc-500">
                  BACK
                </span>
              )}
              <div
                className={`absolute bottom-0 flex w-full justify-around px-4 pb-2 ${
                  isBack ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`h-16 w-14 rounded-b-2xl ${
                    color === "black" ? "bg-[#1a1a1e]" : "bg-[#e8e6e0]"
                  }`}
                />
                <div
                  className={`h-16 w-14 rounded-b-2xl ${
                    color === "black" ? "bg-[#1a1a1e]" : "bg-[#e8e6e0]"
                  }`}
                />
              </div>
              {/* logo on upper back */}
              <div className="absolute left-1/2 top-[38%] w-[62%] -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={logoSrc}
                  alt="KillsComfort logo placement"
                  width={800}
                  height={280}
                  className="h-auto w-full"
                  unoptimized
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div
              className={`relative h-[78%] w-[90%] rounded-3xl border-2 ${
                color === "black" ? "border-zinc-700" : "border-zinc-300"
              }`}
            >
              <span className="absolute left-3 top-6 text-[10px] tracking-[0.25em] text-zinc-500">
                FRONT
              </span>
              <div
                className={`absolute left-0 top-0 h-10 w-20 rounded-br-3xl ${
                  color === "black" ? "bg-[#1a1a1e]" : "bg-[#e8e6e0]"
                }`}
              />
              <div
                className={`absolute right-0 top-0 h-10 w-20 rounded-bl-3xl ${
                  color === "black" ? "bg-[#1a1a1e]" : "bg-[#e8e6e0]"
                }`}
              />
              <div
                className={`absolute bottom-0 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-t-full ${
                  color === "black" ? "bg-zinc-800" : "bg-zinc-200"
                }`}
              />
              {/* logo on chest */}
              <div className="absolute left-1/2 top-[32%] w-[58%] -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={logoSrc}
                  alt="KillsComfort logo placement"
                  width={800}
                  height={280}
                  className="h-auto w-full"
                  unoptimized
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1 border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">
        <p>
          Printful file:{" "}
          <code className="text-zinc-400">
            {color === "black" ? "logo-chrome-3000w.png" : "logo-chrome-outline-3000w.png"}
          </code>
        </p>
        <p>Upload from project folder: <code className="text-zinc-400">print-files/</code></p>
      </div>
    </div>
  );
}

export default function PrintPreviewPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <Link href="/merch" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back to merch
        </Link>

        <p className="mt-8 text-[11px] tracking-[0.4em] text-zinc-500">PRINTFUL SETUP</p>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide">
          Logo placement preview
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Use these placements when you create products in Printful. Black garments get the chrome
          logo; white garments get the dark-outlined version so it stays readable.
        </p>

        <section className="mt-12">
          <h2 className="mb-6 text-lg font-bold uppercase tracking-wide text-zinc-200">
            Booty shorts — low-rise cotton, logo on back
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <PlacementCard
              title="Fine Shyts"
              placement="back"
              color="black"
              garment="shorts"
              logoSrc="/merch/logo-chrome.png"
            />
            <PlacementCard
              title="Fine Shyts"
              placement="back"
              color="white"
              garment="shorts"
              logoSrc="/merch/logo-chrome-outline.png"
            />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-lg font-bold uppercase tracking-wide text-zinc-200">
            Crop top — logo on front chest
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <PlacementCard
              title="KillsComfort Crop Top"
              placement="front"
              color="black"
              garment="shirt"
              logoSrc="/merch/logo-chrome.png"
            />
            <PlacementCard
              title="KillsComfort Crop Top"
              placement="front"
              color="white"
              garment="shirt"
              logoSrc="/merch/logo-chrome-outline.png"
            />
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
          <h3 className="font-semibold uppercase tracking-wide text-zinc-200">Printful checklist</h3>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li>
              Fine Shyts: sourcing board <strong>#1 — Low-Rise Cotton Boyshort</strong>. Pick a
              <strong> low-rise 100% cotton</strong> blank (not mid-rise active, high-waist, or
              biker). Logo centered on the <strong>back</strong>. DTG print.
            </li>
            <li>Crop top: DTG tee/crop, place logo on <strong>front chest</strong></li>
            <li>Black → <code>print-files/logo-chrome-3000w.png</code></li>
            <li>White → <code>print-files/logo-chrome-outline-3000w.png</code></li>
            <li>Set variant SKUs: <code>KC-SHORTS-BLK-M</code>, <code>KC-CROP-WHT-S</code>, etc.</li>
            <li>Then run <code>npm run printful:sync</code></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
