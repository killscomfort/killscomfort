#!/usr/bin/env node

/**
 * Validates Apple Pay prerequisites and opens PayPal registration pages.
 * Domain registration must be completed once in the PayPal Developer Dashboard
 * (direct merchants cannot use the wallet-domains API without partner auth).
 */

import { execSync } from "node:child_process";

const clientId =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killscomfort.com";
const domain = process.env.APPLE_PAY_DOMAIN_NAME || new URL(siteUrl).hostname;
const isSandbox =
  (process.env.PAYPAL_MODE || process.env.NEXT_PUBLIC_PAYPAL_MODE || "sandbox") ===
  "sandbox";
const fileUrl = `${siteUrl.replace(/\/$/, "")}/.well-known/apple-developer-merchantid-domain-association`;

const appDashboardUrl = clientId
  ? `https://developer.paypal.com/dashboard/applications/${isSandbox ? "sandbox" : "live"}/${clientId}`
  : `https://developer.paypal.com/dashboard/applications/${isSandbox ? "sandbox" : "live"}`;

const sandboxOnboardingUrl =
  "https://www.sandbox.paypal.com/bizsignup/add-product?product=payment_methods&capabilities=APPLE_PAY";

console.log("Apple Pay registration helper\n");
console.log(`Domain to register: ${domain}`);
console.log(`Verification file: ${fileUrl}\n`);

try {
  const response = await fetch(fileUrl, { redirect: "manual" });
  const body = (await response.text()).trim();
  const contentType = response.headers.get("content-type") || "";

  if (response.status !== 200 || contentType.includes("text/html") || body.length < 100) {
    console.error("FAIL: Domain verification file is not ready on production.");
    console.error(`Status ${response.status}, length ${body.length}`);
    process.exit(1);
  }

  console.log("OK: Verification file is live.\n");
  console.log("Complete these PayPal steps (one-time):\n");
  console.log("1. Enable Apple Pay on your REST app");
  console.log(`   ${appDashboardUrl}`);
  console.log("   → Features → check Apple Pay → Save");
  console.log("   → Apple Pay section → Manage → Add Domain");
  console.log(`   → Enter: ${domain} → Register Domain\n`);

  if (isSandbox) {
    console.log("2. If Apple Pay is disabled on your sandbox business account:");
    console.log(`   ${sandboxOnboardingUrl}\n`);
  }

  console.log("3. Test on Safari (iPhone or Mac) at /checkout\n");

  if (process.platform === "darwin") {
    console.log("Opening PayPal Developer Dashboard in your default browser...");
    execSync(`open "${appDashboardUrl}"`, { stdio: "ignore" });
  } else {
    console.log(`Open this URL manually: ${appDashboardUrl}`);
  }
} catch (error) {
  console.error("Could not verify domain file:", error instanceof Error ? error.message : error);
  process.exit(1);
}
