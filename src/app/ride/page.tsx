import { RidePageClient } from "@/components/ride/RidePageClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Motion Is Faith",
  description:
    "Ride through Miami, roll into the warehouse, build a beat, dig the crates, and find what's stashed inside.",
  path: "/ride",
});

export default function RidePage() {
  return <RidePageClient />;
}
