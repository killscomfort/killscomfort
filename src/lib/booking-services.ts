export type BookingService = {
  slug: string;
  name: string;
  description: string;
  /** Present only for legacy purchasable services — unused for current offers */
  priceCents?: number;
};

/** Services shown on /services — inquire by email, no cart checkout. */
export const BOOKING_SERVICES: BookingService[] = [
  {
    slug: "ai-fluency-consultation",
    name: "AI Fluency Consultation",
    description:
      "Practical guidance on using AI in your creative and business workflow — tools, prompts, and systems that actually move work forward.",
  },
  {
    slug: "audio-engineering",
    name: "Audio Engineering",
    description:
      "Mixing, mastering, session work, and sonic polish — SAE-trained engineering for tracks, live setups, and brand sound.",
  },
  {
    slug: "av-production-assistant",
    name: "AV Production Assistant",
    description:
      "On-site and remote support for live events, shoots, and installs — signal flow, gear, and production logistics handled.",
  },
];

/** Only priced services are cart-eligible. Current offers are inquiry-only. */
export function getBookingService(slug: string) {
  const service = BOOKING_SERVICES.find((item) => item.slug === slug);
  if (!service?.priceCents) return undefined;
  return service as BookingService & { priceCents: number };
}
