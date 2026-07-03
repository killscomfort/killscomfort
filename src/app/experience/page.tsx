import KillsComfortExperience from "@/components/experience/KillsComfortExperience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Ride",
  description: "Motion Is Faith. Ride in, dig the crates, cop the fit.",
  path: "/experience",
});

export default function ExperiencePage() {
  return <KillsComfortExperience />;
}
