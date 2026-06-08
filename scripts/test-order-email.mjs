#!/usr/bin/env node
/**
 * Send test order confirmation emails.
 * Usage: node --env-file=.env.local scripts/test-order-email.mjs [recipient@email.com]
 */
import { Resend } from "resend";

const to = process.argv[2] || process.env.ORDERS_NOTIFICATION_EMAIL || "Killscomfort@gmail.com";
const key = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "KillsComfort <orders@killscomfort.com>";

if (!key) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const resend = new Resend(key);

const html = `
  <h2>Test — Order confirmed</h2>
  <p>Thanks! This is a test confirmation from KillsComfort checkout.</p>
  <p><strong>Order:</strong> KC-TEST123</p>
  <p><strong>Total:</strong> $1.00</p>
`;

async function main() {
  const admin = await resend.emails.send({
    from,
    to: process.env.ORDERS_NOTIFICATION_EMAIL || to,
    subject: "Test — New Merch Order KC-TEST123",
    html: `<h2>Test admin notification</h2>${html}`,
  });

  const customer = await resend.emails.send({
    from,
    to,
    subject: "Test — Order confirmed KC-TEST123",
    html,
  });

  console.log("From:", from);
  console.log("Admin:", admin.error ? admin.error : admin.data);
  console.log("Customer:", customer.error ? customer.error : customer.data);

  if (admin.error || customer.error) process.exit(1);
}

main();
