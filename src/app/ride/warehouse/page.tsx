import { WarehouseGameClient } from "@/components/ride/WarehouseGameClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Motion Is Faith",
  description:
    "Pick a card and breach the warehouse — roll in, build a beat, dig crates, and find what's stashed inside.",
  path: "/ride/warehouse",
});

export default function WarehouseGamePage() {
  return <WarehouseGameClient />;
}
