import { Resend } from "resend";
import { SITE } from "@/lib/constants";
import type { InquiryInput, SimpleInquiryInput } from "@/lib/validations";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendInquiryNotification(
  inquiry: InquiryInput | SimpleInquiryInput
) {
  if (!resend) {
    console.log("[email] Resend not configured — skipping notification");
    return;
  }

  const to = process.env.INQUIRY_NOTIFICATION_EMAIL || SITE.email;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || `${SITE.name} <${SITE.email}>`,
    to,
    subject: `New Booking Inquiry — ${inquiry.name}`,
    html: `
      <h2>New Booking Inquiry</h2>
      <p><strong>Name:</strong> ${inquiry.name}</p>
      <p><strong>Email:</strong> ${inquiry.email}</p>
      ${"phone" in inquiry && inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ""}
      <p><strong>Event Type:</strong> ${inquiry.event_type}</p>
      ${inquiry.event_date ? `<p><strong>Date:</strong> ${inquiry.event_date}</p>` : ""}
      ${"event_location" in inquiry && inquiry.event_location ? `<p><strong>Location:</strong> ${inquiry.event_location}</p>` : ""}
      ${"budget_range" in inquiry && inquiry.budget_range ? `<p><strong>Budget:</strong> ${inquiry.budget_range}</p>` : ""}
      ${inquiry.message ? `<p><strong>Message:</strong><br/>${inquiry.message}</p>` : ""}
      ${inquiry.source ? `<p><strong>Source:</strong> ${inquiry.source}</p>` : ""}
    `,
  });
}

export async function sendInquiryConfirmation(
  name: string,
  email: string
) {
  if (!resend) {
    console.log("[email] Resend not configured — skipping confirmation");
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || `${SITE.name} <${SITE.email}>`,
    to: email,
    subject: `We got your inquiry — ${SITE.name}`,
    html: `
      <h2>Thanks, ${name}.</h2>
      <p>Your inquiry has been received. Gregory personally reviews every booking request and will get back to you within 24–48 hours.</p>
      <p>In the meantime, check out the latest mixes and stay connected:</p>
      <p><a href="${SITE.url}/music">Listen to Music</a></p>
      <p>— ${SITE.name}<br/>${SITE.tagline}</p>
    `,
  });
}
