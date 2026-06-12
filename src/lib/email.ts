import { SITE } from "@/lib/constants";
import type { InquiryInput, SimpleInquiryInput } from "@/lib/validations";
import { sendEmail } from "@/lib/resend-client";
import {
  emailButton,
  emailDetailBlock,
  emailParagraph,
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
