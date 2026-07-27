#!/usr/bin/env node
/**
 * Send a test weekly Miami events newsletter to yourself.
 * Usage: node --env-file=.env.local scripts/test-newsletter-draft-email.mjs [recipient@email.com]
 */
import { Resend } from "resend";

const to =
  process.argv[2] ||
  process.env.INQUIRY_NOTIFICATION_EMAIL ||
  "Killscomfort@gmail.com";
const key = process.env.RESEND_API_KEY;
const from =
  process.env.EMAIL_FROM ||
  process.env.RESEND_TEST_FROM ||
  "KillsComfort <orders@killscomfort.com>";
const replyTo =
  process.env.EMAIL_REPLY_TO?.trim() ||
  process.env.INQUIRY_NOTIFICATION_EMAIL?.trim() ||
  "killscomfort@gmail.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://killscomfort.com";

const placeholders = ["placeholder", "your-", "xxxxxxxx", "re_xxxxxxxx"];
if (!key || placeholders.some((token) => key.toLowerCase().includes(token))) {
  console.error(
    "Missing or placeholder RESEND_API_KEY in .env.local — get one at https://resend.com/api-keys"
  );
  process.exit(1);
}

const resend = new Resend(key);

const sampleEvents = [
  {
    title: "Art Club — Thursdays",
    date: "Thu, Jul 10, 2026",
    venue: "The Boombox Miami",
    source: "@artclubforever",
    note: "Art Wars · 7pm–12am",
  },
  {
    title: "Underground House Night",
    date: "Fri, Jul 11, 2026",
    venue: "ToeJam Backlot",
    source: "@toejambacklot",
    note: "Warehouse vibes · Wynwood",
  },
  {
    title: "Echodealer presents — Wet Rave",
    date: "Sat, Jul 12, 2026",
    venue: "Andrew House",
    source: "@echodealer",
    note: "Miami UG music scene",
  },
  {
    title: "Live at Churchill's",
    date: "Sat, Jul 12, 2026",
    venue: "Churchill's Pub",
    source: "@churchills_pub",
    note: "Punk · hardcore · metal",
  },
  {
    title: "Las Rosas — Local bands",
    date: "Sun, Jul 13, 2026",
    venue: "Las Rosas",
    source: "@lasrosasmiami",
    note: "Allapattah dive · doors 5pm",
  },
];

function emailParagraph(html) {
  return `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#ffffff;opacity:0.88;">${html}</p>`;
}

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
            <td style="padding:8px 28px 28px;">${content}</td>
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

const weekLabel = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
});
const subject = `Miami this week — ${weekLabel}`;
const preheader = "Miami events, shows, and culture this week.";

const eventList = sampleEvents
  .map(
    (event) =>
      `<li style="margin-bottom:16px;"><strong>${event.title}</strong><br/>${event.date}<br/>@ ${event.venue}<br/>${event.note}<br/><span style="opacity:0.55;font-size:13px;">via ${event.source}</span></li>`
  )
  .join("");

const content = [
  emailParagraph(
    "Here&apos;s what&apos;s happening in Miami this week — pulled from @killscomfort, @toejambacklot, @theboomboxmiami, @artclubforever, @echodealer, and the local scene."
  ),
  `<ul style="margin:0 0 20px;padding-left:18px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#ffffff;opacity:0.88;">${eventList}</ul>`,
  emailParagraph(
    `Want <strong>KillsComfort</strong> at your next event? <a href="${siteUrl}/book" style="color:#ffffff;text-decoration:underline;">Book an inquiry</a>.`
  ),
  emailParagraph(
    `<span style="font-size:13px;opacity:0.55;">Test send — <a href="${siteUrl}/newsletter/unsubscribe?token=00000000-0000-0000-0000-000000000000" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a></span>`
  ),
].join("");

const html = renderEmailLayout(subject, content, preheader);

async function main() {
  console.log("Sending test Miami events newsletter…");
  console.log("From:", from);
  console.log("To:", to);
  console.log("Subject:", subject);

  const result = await resend.emails.send({
    from,
    replyTo,
    to,
    subject: `[TEST] ${subject}`,
    html,
  });

  if (result.error) {
    console.error("Send failed:", result.error);
    process.exit(1);
  }

  console.log("Sent:", result.data);
}

main();
