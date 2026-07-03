import { Resend } from "resend";
import { SITE } from "@/lib/constants";

let client: Resend | null = null;

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function getEmailFrom() {
  return (
    process.env.EMAIL_FROM ||
    `${SITE.name} <orders@killscomfort.com>`
  );
}

/** Replies to site emails go here — orders@ is send-only (no inbox). */
export function getEmailReplyTo() {
  return (
    process.env.EMAIL_REPLY_TO?.trim() ||
    process.env.INQUIRY_NOTIFICATION_EMAIL?.trim() ||
    SITE.email
  ).toLowerCase();
}

export function getOrdersNotificationEmail() {
  return (
    process.env.ORDERS_NOTIFICATION_EMAIL ||
    process.env.INQUIRY_NOTIFICATION_EMAIL ||
    SITE.email
  ).toLowerCase();
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.log("[email] Resend not configured — skipping:", params.subject);
    return { ok: false as const, skipped: true as const };
  }

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    replyTo: getEmailReplyTo(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error("[email] Send failed:", params.subject, error);
    return { ok: false as const, skipped: false as const, error };
  }

  return { ok: true as const, id: data?.id };
}
