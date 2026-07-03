import { createClient } from "@/lib/supabase/server";
import { createMusicEntry, deleteMusicEntry } from "@/lib/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminCard";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { MusicEntry } from "@/types/database";

export default async function AdminMusicPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("music_entries")
    .select("*")
    .order("sort_order", { ascending: true });

  const items = (entries || []) as MusicEntry[];

  return (
    <>
      <AdminPageHeader
        title="Music"
        description="DJ mixes, originals, and remixes with embed links."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminPanel title="Add Track">
          <form action={createMusicEntry} className="space-y-4">
            <Input name="title" label="Title" required />
            <Select
              name="category"
              label="Category"
              options={["dj_mix", "original", "remix"]}
              required
            />
            <Input name="platform" label="Platform" defaultValue="soundcloud" />
            <Input name="embed_url" label="Embed URL" />
            <Input name="external_url" label="External Listen URL" />
            <Input
              name="sort_order"
              label="Sort Order"
              type="number"
              defaultValue="0"
            />
            <label className="flex items-center gap-2 text-sm text-bone/80">
              <input type="checkbox" name="featured" className="accent-muted-gold" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-bone/80">
              <input type="checkbox" name="published" defaultChecked className="accent-muted-gold" />
              Published
            </label>
            <Button type="submit" size="sm">
              Add Track
            </Button>
          </form>
        </AdminPanel>

        <div className="space-y-4">
          <h2 className="text-display text-lg uppercase text-bone">
            All Tracks ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-bone/50">No music entries yet.</p>
          ) : (
            items.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-4 border border-clay/20 bg-warm-charcoal/50 p-4"
              >
                <div>
                  <h3 className="text-bone">
                    {entry.title}
                    {entry.featured && (
                      <span className="ml-2 text-xs text-muted-gold">★</span>
                    )}
                  </h3>
                  <p className="text-xs text-bone/40">
                    {entry.category} · {entry.platform} · order {entry.sort_order}{" "}
                    · {entry.published ? "Published" : "Draft"}
                  </p>
                  {entry.external_url && (
                    <a
                      href={entry.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-muted-gold hover:text-bone"
                    >
                      Listen →
                    </a>
                  )}
                </div>
                <DeleteButton action={deleteMusicEntry} id={entry.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
