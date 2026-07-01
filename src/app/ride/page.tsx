import { RideArcadeClient } from "@/components/ride/RideArcadeClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Play",
  description: "Choose your entrance — the room, street run, or warehouse ride.",
  path: "/ride",
});

export default function RidePage() {
  return <RideArcadeClient />;
}
