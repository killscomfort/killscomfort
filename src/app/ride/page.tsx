import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Play",
  description: "Start in the bedroom — leave the door for the street, then ride into the warehouse.",
  path: "/ride",
});

export default function RidePage() {
  redirect("/ride/room");
}
