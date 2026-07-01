import { StreetGameClient } from "@/components/ride/StreetGameClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Street Run",
  description: "Lane-dodge bike run — steer, survive, chase the score.",
  path: "/ride/street",
});

export default function StreetGamePage() {
  return <StreetGameClient />;
}
