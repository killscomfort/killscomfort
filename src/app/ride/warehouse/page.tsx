import { WarehouseGameClient } from "@/components/ride/WarehouseGameClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Motion Is Faith",
  description:
    "Ride through Miami, roll into the warehouse, build a beat, dig the crates, and find what's stashed inside.",
  path: "/ride/warehouse",
});

export default function WarehouseGamePage() {
  return <WarehouseGameClient />;
}
