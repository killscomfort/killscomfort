import KillsComfortExperience from "@/components/experience/KillsComfortExperience";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Warehouse",
  description: "Motion Is Faith. Ride in, dig the crates, cop the fit.",
  path: "/warehouse",
});

export default function WarehousePage() {
  return <KillsComfortExperience />;
}
