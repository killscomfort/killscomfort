#!/usr/bin/env node
/**
 * Send test order confirmation emails using the site-branded template.
 * Usage: node --env-file=.env.local scripts/test-order-email.mjs [recipient@email.com]
 */
import { Resend } from "resend";

const to = process.argv[2] || process.env.ORDERS_NOTIFICATION_EMAIL || "Killscomfort@gmail.com";
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "KillsComfort <orders@killscomfort.com>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://killscomfort.com";

if (!key) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const resend = new Resend(key);

function renderEmailLayout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#000000;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0e0e0e;border:1px solid rgba(255,255,255,0.12);">
        <tr><td style="padding:28px 28px 0;"><p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#ffffff;opacity:0.7;">KillsComfort</p></td></tr>
        <tr><td style="padding:24px 28px 8px;"><h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#ffffff;">${title}</h1></td></tr>
        <tr><td style="padding:8px 28px 28px;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#ffffff;opacity:0.88;">${content}</td></tr>
        <tr><td style="padding:24px 28px;border-top:1px solid rgba(255,255,255,0.12);"><p style="margin:0;font-family:Georgia,serif;font-size:13px;color:#ffffff;opacity:0.5;">Growth lives on the otherside of killing your comforts</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const customerHtml = renderEmailLayout(
  "Order confirmed",
  `<p style="margin:0 0 16px;">Thanks! This is a test confirmation from KillsComfort checkout.</p>
   <p style="margin:0;"><strong>Order:</strong> KC-TEST123<br/><strong>Total:</strong> $1.00</p>`
);

const adminHtml = renderEmailLayout(
  "New merch order",
  `<p style="margin:0 0 16px;">Test admin notification.</p>
   <p style="margin:0;"><strong>Order:</strong> KC-TEST123<br/><strong>Total:</strong> $1.00</p>
   <p style="margin:16px 0 0;"><a href="${siteUrl}/admin/orders" style="color:#ffffff;">View in admin</a></p>`
);

async function main() {
  const admin = await resend.emails.send({
    from,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.ORDERS_NOTIFICATION_EMAIL || to,
    to: process.env.ORDERS_NOTIFICATION_EMAIL || to,
    subject: "Test — New Merch Order KC-TEST123",
    html: adminHtml,
  });

  const customer = await resend.emails.send({
    from,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.ORDERS_NOTIFICATION_EMAIL || to,
    to,
    subject: "Test — Order confirmed KC-TEST123",
    html: customerHtml,
  });

  console.log("From:", from);
  console.log("Admin:", admin.error ? admin.error : admin.data);
  console.log("Customer:", customer.error ? customer.error : customer.data);

  if (admin.error || customer.error) process.exit(1);
}

main();
