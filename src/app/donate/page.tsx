import { DonatePage } from "@/components/donate/DonatePage";
import { createMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Donate",
  description: `Support ${SITE.name} — fund the Rollout Studio App and keep the music going.`,
  path: "/donate",
});

export default function DonateRoute() {
  return <DonatePage />;
}
