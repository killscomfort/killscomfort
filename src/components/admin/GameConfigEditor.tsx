"use client";

import { useState, useTransition } from "react";
import type { RideGameConfig } from "@/lib/game-config";
import { updateRideGameConfig } from "@/lib/admin/actions";
import { AdminCard } from "@/components/admin/AdminCard";

type Props = {
  initial: RideGameConfig;
};

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full border border-clay/30 bg-near-black px-3 py-2 text-sm text-bone focus:border-muted-gold/50 focus:outline-none";

  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-bone/50">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
      <span className="mt-1 block text-[10px] text-bone/40">Use | for line breaks in titles</span>
    </label>
  );
}

function JsonField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-bone/50">{label}</span>
      <textarea
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-clay/30 bg-near-black px-3 py-2 font-mono text-xs text-bone focus:border-muted-gold/50 focus:outline-none"
      />
      <span className="mt-1 block text-[10px] text-bone/40">{hint}</span>
    </label>
  );
}

export function GameConfigEditor({ initial }: Props) {
  const [config, setConfig] = useState(initial);
  const [recordsJson, setRecordsJson] = useState(JSON.stringify(initial.records, null, 2));
  const [wallJson, setWallJson] = useState(JSON.stringify(initial.wall, null, 2));
  const [mixesJson, setMixesJson] = useState(JSON.stringify(initial.mixes, null, 2));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setMessage(null);
    setError(null);

    let records: RideGameConfig["records"];
    let wall: RideGameConfig["wall"];
    let mixes: RideGameConfig["mixes"];

    try {
      records = JSON.parse(recordsJson);
      wall = JSON.parse(wallJson);
      mixes = JSON.parse(mixesJson);
    } catch {
      setError("Records, wall, or mixes JSON is invalid.");
      return;
    }

    const payload: RideGameConfig = { ...config, records, wall, mixes };

    startTransition(async () => {
      try {
        await updateRideGameConfig(payload);
        setConfig(payload);
        setMessage("Game content saved. Refresh /ride to see changes.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save game content.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <AdminCard>
        <p className="text-sm text-bone/70">
          Edit ride copy and content. Changes apply live at{" "}
          <a href="/ride" target="_blank" rel="noopener noreferrer" className="text-muted-gold hover:text-bone">
            /ride
          </a>{" "}
          after save (players may need a refresh).
        </p>
      </AdminCard>

      <section className="space-y-4">
        <h2 className="text-display text-lg uppercase text-bone">Enter screen</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Mark"
            value={config.enter.mark}
            onChange={(mark) => setConfig((c) => ({ ...c, enter: { ...c.enter, mark } }))}
          />
          <Field
            label="CTA button"
            value={config.enter.cta}
            onChange={(cta) => setConfig((c) => ({ ...c, enter: { ...c.enter, cta } }))}
          />
          <Field
            label="Title"
            value={config.enter.title}
            onChange={(title) => setConfig((c) => ({ ...c, enter: { ...c.enter, title } }))}
          />
          <div className="md:col-span-2">
            <Field
              label="Lede"
              value={config.enter.lede}
              multiline
              onChange={(lede) => setConfig((c) => ({ ...c, enter: { ...c.enter, lede } }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-display text-lg uppercase text-bone">Warehouse hub</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={config.hub.eyebrow}
            onChange={(eyebrow) => setConfig((c) => ({ ...c, hub: { ...c.hub, eyebrow } }))}
          />
          <Field
            label="Title"
            value={config.hub.title}
            onChange={(title) => setConfig((c) => ({ ...c, hub: { ...c.hub, title } }))}
          />
          <div className="md:col-span-2">
            <Field
              label="Lede"
              value={config.hub.lede}
              multiline
              onChange={(lede) => setConfig((c) => ({ ...c, hub: { ...c.hub, lede } }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-display text-lg uppercase text-bone">Exit screen</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Eyebrow"
            value={config.exit.eyebrow}
            onChange={(eyebrow) => setConfig((c) => ({ ...c, exit: { ...c.exit, eyebrow } }))}
          />
          <Field
            label="Title"
            value={config.exit.title}
            onChange={(title) => setConfig((c) => ({ ...c, exit: { ...c.exit, title } }))}
          />
          <div className="md:col-span-2">
            <Field
              label="Lede"
              value={config.exit.lede}
              multiline
              onChange={(lede) => setConfig((c) => ({ ...c, exit: { ...c.exit, lede } }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-display text-lg uppercase text-bone">Links</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(["book", "music", "merch", "instagram"] as const).map((key) => (
            <Field
              key={key}
              label={key}
              value={config.links[key]}
              onChange={(value) =>
                setConfig((c) => ({ ...c, links: { ...c.links, [key]: value } }))
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-display text-lg uppercase text-bone">Hidden merch panel</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Title"
            value={config.merch.title}
            onChange={(title) => setConfig((c) => ({ ...c, merch: { ...c.merch, title } }))}
          />
          <Field
            label="CTA"
            value={config.merch.cta}
            onChange={(cta) => setConfig((c) => ({ ...c, merch: { ...c.merch, cta } }))}
          />
          <div className="md:col-span-2">
            <Field
              label="Lede"
              value={config.merch.lede}
              multiline
              onChange={(lede) => setConfig((c) => ({ ...c, merch: { ...c.merch, lede } }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-display text-lg uppercase text-bone">Advanced content (JSON)</h2>
        <JsonField
          label="Crate records"
          hint='[{ "t": "TITLE", "s": "KC · 2024", "gem": false }]'
          value={recordsJson}
          onChange={setRecordsJson}
        />
        <JsonField
          label="Community wall seed posts"
          hint='[{ "by": "YOU", "p": "Your message" }]'
          value={wallJson}
          onChange={setWallJson}
        />
        <JsonField
          label="Secret mixes"
          hint='[{ "id": "rooftop", "t": "Title", "s": "HOUSE · 124", "src": "your beat", "motif": [0,4,7] }]'
          value={mixesJson}
          onChange={setMixesJson}
        />
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="bg-muted-gold px-6 py-3 text-sm font-medium uppercase tracking-widest text-near-black disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save game content"}
        </button>
        {message && <p className="text-sm text-moss-green">{message}</p>}
        {error && <p className="text-sm text-dried-blood">{error}</p>}
      </div>
    </div>
  );
}
