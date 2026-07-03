import { SITE, SOCIAL_LINKS } from "@/lib/constants";
import type { InquiryInput, SimpleInquiryInput } from "@/lib/validations";
import { sendEmail } from "@/lib/resend-client";
import {
  emailButton,
  emailDetailBlock,
  emailList,
  emailParagraph,
  emailUnsubscribeLink,
  escapeHtml,
  renderEmailLayout,
} from "@/lib/email-template";

export async function sendInquiryNotification(
  inquiry: InquiryInput | SimpleInquiryInput,
  visitorIp?: string | null
) {
  const content = [
    emailParagraph("A new booking inquiry just came in."),
    emailDetailBlock([
      { label: "Name", value: escapeHtml(inquiry.name) },
      { label: "Email", value: `<a href="mailto:${escapeHtml(inquiry.email)}" style="color:#ffffff;">${escapeHtml(inquiry.email)}</a>` },
      ...("phone" in inquiry && inquiry.phone
        ? [{ label: "Phone", value: escapeHtml(inquiry.phone) }]
        : []),
      { label: "Preferred contact", value: escapeHtml(inquiry.preferred_contact) },
      ...(inquiry.event_date
        ? [{ label: "Event date", value: escapeHtml(inquiry.event_date) }]
        : []),
      ...(inquiry.message
        ? [{ label: "Event details", value: escapeHtml(inquiry.message).replace(/\n/g, "<br/>") }]
        : []),
      ...(visitorIp ? [{ label: "Visitor IP", value: escapeHtml(visitorIp) }] : []),
      ...(inquiry.source ? [{ label: "Source", value: escapeHtml(inquiry.source) }] : []),
    ]),
    emailButton(`${SITE.url}/admin/inquiries`, "View in admin"),
  ].join("");

  return sendEmail({
    to: process.env.INQUIRY_NOTIFICATION_EMAIL || SITE.email,
    subject: `New Booking Inquiry — ${inquiry.name}`,
    html: renderEmailLayout({
      title: "New booking inquiry",
      preheader: `${inquiry.name} submitted a booking request.`,
      content,
    }),
  });
}

export async function sendNewsletterNotification(
  email: string,
  source?: string | null
) {
  const content = [
    emailParagraph("Someone just joined the newsletter."),
    emailDetailBlock([
      {
        label: "Email",
        value: `<a href="mailto:${escapeHtml(email)}" style="color:#ffffff;">${escapeHtml(email)}</a>`,
      },
      ...(source ? [{ label: "Source", value: escapeHtml(source) }] : []),
    ]),
    emailButton(`${SITE.url}/admin/newsletter`, "View subscribers"),
  ].join("");

  return sendEmail({
    to: process.env.INQUIRY_NOTIFICATION_EMAIL || SITE.email,
    subject: `New newsletter signup — ${SITE.name}`,
    html: renderEmailLayout({
      title: "New newsletter signup",
      preheader: `${email} subscribed to the newsletter.`,
      content,
    }),
  });
}

export async function sendNewsletterConfirmation(
  email: string,
  unsubscribeToken: string
) {
  const unsubscribeUrl = `${SITE.url}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const content = [
    emailParagraph(
      "You just joined the <strong>KillsComfort</strong> community — a movement for people who choose growth over comfort, creative expression over autopilot, and the work of becoming over staying the same."
    ),
    emailParagraph("Here&apos;s what you can expect from us:"),
    emailList([
      "New music, mixes, and releases before they hit the feed",
      "Shows, events, and booking updates in Miami and beyond",
      "Ideas and reminders to keep finding new ways to kill your comforts",
    ]),
    emailParagraph(
      "We won&apos;t flood your inbox. You&apos;ll only hear from us when there&apos;s something worth saying."
    ),
    emailParagraph(
      `Glad you&apos;re here.<br/><br/>— <strong>${escapeHtml(SITE.founder)}</strong><br/><span style="opacity:0.65;">${escapeHtml(SITE.founderRoles)}</span>`
    ),
    emailButton(`${SITE.url}/music`, "Listen to music"),
    emailButton(`${SITE.url}/book`, "Book a show"),
    emailParagraph(
      `Follow along on <a href="${SOCIAL_LINKS.instagram}" style="color:#ffffff;text-decoration:underline;">Instagram</a> for day-to-day drops and behind-the-scenes moments.`
    ),
    emailUnsubscribeLink(unsubscribeUrl),
  ].join("");

  return sendEmail({
    to: email,
    subject: `Welcome to the ${SITE.name} community`,
    html: renderEmailLayout({
      title: "Welcome to the community",
      preheader:
        "You're in. New music, shows, and ways to kill your comforts — straight to your inbox.",
      content,
    }),
  });
}

export async function sendInquiryConfirmation(name: string, email: string) {
  const content = [
    emailParagraph(`Thanks, <strong>${escapeHtml(name)}</strong>.`),
    emailParagraph(
      "Your inquiry has been received. Gregory personally reviews every booking request and will get back to you within 24–48 hours."
    ),
    emailParagraph("In the meantime, check out the latest mixes and stay connected."),
    emailButton(`${SITE.url}/music`, "Listen to music"),
  ].join("");

  return sendEmail({
    to: email,
    subject: `We got your inquiry — ${SITE.name}`,
    html: renderEmailLayout({
      title: "Inquiry received",
      preheader: "We received your booking inquiry and will respond soon.",
      content,
    }),
  });
}
