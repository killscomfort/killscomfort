import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import LandClient from "./LandClient";

export const metadata = createMetadata({
  title: "Enter",
  description: `Scroll through ${SITE.name} — music, merch, and the warehouse beyond comfort.`,
  path: "/land",
});

export default function LandPage() {
  return <LandClient />;
}
