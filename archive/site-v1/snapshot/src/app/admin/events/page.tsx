import { createClient } from "@/lib/supabase/server";
import { createEvent, deleteEvent } from "@/lib/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminCard";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types/database";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  const items = (events || []) as Event[];

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Past events and gallery entries."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminPanel title="Add Event">
          <form action={createEvent} className="space-y-4">
            <Input name="title" label="Title" required />
            <Input name="venue" label="Venue" />
            <Input name="event_date" label="Date" type="date" />
            <Input name="category" label="Category" defaultValue="club" />
            <Input name="cover_image" label="Cover Image URL" />
            <Textarea name="description" label="Description" rows={3} />
            <label className="flex items-center gap-2 text-sm text-bone/80">
              <input type="checkbox" name="published" defaultChecked className="accent-muted-gold" />
              Published
            </label>
            <Button type="submit" size="sm">
              Add Event
            </Button>
          </form>
        </AdminPanel>

        <div className="space-y-4">
          <h2 className="text-display text-lg uppercase text-bone">
            All Events ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-bone/50">No events yet.</p>
          ) : (
            items.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 border border-clay/20 bg-warm-charcoal/50 p-4"
              >
                <div>
                  <h3 className="text-bone">{event.title}</h3>
                  <p className="text-sm text-bone/50">
                    {event.venue || "No venue"}
                    {event.event_date && ` · ${formatDate(event.event_date)}`}
                  </p>
                  <p className="text-xs text-bone/40">
                    {event.category} · {event.published ? "Published" : "Draft"}
                  </p>
                </div>
                <DeleteButton action={deleteEvent} id={event.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
