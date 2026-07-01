import { RoomGameClient } from "@/components/ride/RoomGameClient";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "The Room",
  description: "Pixel room — pick a character, explore, dance, and interact.",
  path: "/ride/room",
});

export default function RoomGamePage() {
  return <RoomGameClient />;
}
