export type BookingService = {
  slug: string;
  name: string;
  priceCents: number;
  description: string;
};

/** Paid services — deposits and tickets. Custom quotes still go through /book inquiry. */
export const BOOKING_SERVICES: BookingService[] = [
  {
    slug: "dj-booking-deposit",
    name: "DJ Booking Deposit",
    priceCents: 15000,
    description:
      "Reserve your date with a $150 deposit. Applied toward your final event fee — clubs, festivals, private events.",
  },
  {
    slug: "private-lesson",
    name: "Private Lesson (1 hr)",
    priceCents: 7500,
    description:
      "One-on-one session — DJ technique, production, or sound engineering with Gregory Tovar.",
  },
  {
    slug: "event-ticket",
    name: "Event Ticket",
    priceCents: 2500,
    description: "General admission to select KillsComfort events. You'll receive event details by email.",
  },
];

export function getBookingService(slug: string) {
  return BOOKING_SERVICES.find((service) => service.slug === slug);
}
