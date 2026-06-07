import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Events",
  description: `Upcoming events from ${SITE.name} — coming soon.`,
  path: "/events",
});

export default function EventsPage() {
  return (
    <div className="pt-24">
      <section className="section-padding grain-overlay">
        <div className="relative mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center text-center">
          <SectionHeading
            label="Events"
            title="Coming Soon"
            description="New dates, shows, and experiences are on the way. Check back soon — or reach out if you want KillsComfort at your next event."
            align="center"
            className="mx-auto"
          />
          <Button href="/book" size="lg" className="mt-4">
            Book an Inquiry
          </Button>
        </div>
      </section>
    </div>
  );
}
