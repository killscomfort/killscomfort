#!/usr/bin/env node
/**
 * Send a test newsletter welcome email using the site-branded template.
 * Usage: node --env-file=.env.local scripts/test-newsletter-email.mjs [recipient@email.com]
 */
import { Resend } from "resend";

const to = process.argv[2] || process.env.INQUIRY_NOTIFICATION_EMAIL || "Killscomfort@gmail.com";
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "KillsComfort <orders@killscomfort.com>";
const replyTo =
  process.env.EMAIL_REPLY_TO?.trim() ||
  process.env.INQUIRY_NOTIFICATION_EMAIL?.trim() ||
  "Killscomfort@gmail.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://killscomfort.com";
const instagram = "https://instagram.com/killscomfort";

if (!key) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const resend = new Resend(key);

function renderEmailLayout(title, content, preheader) {
  const siteHost = siteUrl.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#000000;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0e0e0e;border:1px solid rgba(255,255,255,0.12);">
          <tr>
            <td style="padding:28px 28px 0;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#ffffff;opacity:0.7;">KillsComfort</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;line-height:1.15;letter-spacing:0.02em;color:#ffffff;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;border-top:1px solid rgba(255,255,255,0.12);">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.6;color:#ffffff;opacity:0.5;">Growth lives on the otherside of killing your comforts</p>
              <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
                <a href="${siteUrl}" style="color:#ffffff;text-decoration:none;opacity:0.65;">${siteHost}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailParagraph(html) {
  return `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#ffffff;opacity:0.88;">${html}</p>`;
}

function emailList(items) {
  return `<ul style="margin:0 0 20px;padding-left:18px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#ffffff;opacity:0.88;">
    ${items.map((item) => `<li style="margin-bottom:8px;">${item}</li>`).join("")}
  </ul>`;
}

function emailButton(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
    <tr>
      <td style="background:#ffffff;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#000000;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

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
    "Glad you&apos;re here.<br/><br/>— <strong>Gregory Tovar</strong><br/><span style=\"opacity:0.65;\">DJ, producer, and sound engineer</span>"
  ),
  emailButton(`${siteUrl}/music`, "Listen to music"),
  emailButton(`${siteUrl}/book`, "Book a show"),
  emailParagraph(
    `Follow along on <a href="${instagram}" style="color:#ffffff;text-decoration:underline;">Instagram</a> for day-to-day drops and behind-the-scenes moments.`
  ),
  emailParagraph(
    `<span style="font-size:13px;opacity:0.55;">Changed your mind? <a href="${siteUrl}/newsletter/unsubscribe?token=00000000-0000-0000-0000-000000000000" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a> from these emails.</span>`
  ),
].join("");

const html = renderEmailLayout(
  "Welcome to the community",
  content,
  "You're in. New music, shows, and ways to kill your comforts — straight to your inbox."
);

async function main() {
  const result = await resend.emails.send({
    from,
    replyTo,
    to,
    subject: "Welcome to the KillsComfort community",
    html,
  });

  console.log("From:", from);
  console.log("To:", to);
  console.log("Result:", result.error ? result.error : result.data);

  if (result.error) process.exit(1);
}

main();
