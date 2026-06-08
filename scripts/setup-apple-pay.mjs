#!/usr/bin/env node

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killscomfort.com";
const domain = process.env.APPLE_PAY_DOMAIN_NAME || new URL(siteUrl).hostname;
const fileUrl = `${siteUrl.replace(/\/$/, "")}/.well-known/apple-developer-merchantid-domain-association`;
const clientId =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "";
const isSandbox =
  (process.env.PAYPAL_MODE || process.env.NEXT_PUBLIC_PAYPAL_MODE || "sandbox") ===
  "sandbox";
const appDashboardUrl = clientId
  ? `https://developer.paypal.com/dashboard/applications/${isSandbox ? "sandbox" : "live"}/${clientId}`
  : `https://developer.paypal.com/dashboard/applications/${isSandbox ? "sandbox" : "live"}`;

console.log("Apple Pay setup check for KillsComfort\n");
console.log(`Site URL: ${siteUrl}`);
console.log(`Register this exact domain in PayPal: ${domain}`);
console.log(`Verification file URL: ${fileUrl}\n`);

try {
  const response = await fetch(fileUrl, { redirect: "manual" });
  const contentType = response.headers.get("content-type") || "";
  const body = (await response.text()).trim();

  console.log(`HTTP status: ${response.status}`);
  console.log(`Content-Type: ${contentType}`);
  console.log(`Body length: ${body.length} chars`);

  if (response.status >= 300 && response.status < 400) {
    console.error("\nFAIL: Apple rejects redirects for the verification file.");
    console.error("Host the file directly on the domain you register in PayPal.");
    process.exit(1);
  }

  if (response.status !== 200) {
    console.error("\nFAIL: Verification file is not live yet.");
    printSetupSteps(domain, isSandbox);
    process.exit(1);
  }

  if (contentType.includes("text/html")) {
    console.error("\nFAIL: File is returning HTML instead of the verification file.");
    printSetupSteps(domain, isSandbox);
    process.exit(1);
  }

  if (body.length < 100) {
    console.error("\nFAIL: Verification file looks empty.");
    printSetupSteps(domain, isSandbox);
    process.exit(1);
  }

  console.log("\nOK: Verification file is reachable on your site.");
  console.log("\nFinal step — register the domain in PayPal (one-time):");
  console.log(`1. Open your REST app: ${appDashboardUrl}`);
  console.log("2. Features → enable Apple Pay → Save");
  console.log("3. Apple Pay → Manage → Add Domain → enter:", domain);
  console.log("4. Click Register Domain");
  if (isSandbox) {
    console.log("\nIf Apple Pay is disabled on your sandbox business account:");
    console.log("https://www.sandbox.paypal.com/bizsignup/add-product?product=payment_methods&capabilities=APPLE_PAY");
  }
  console.log("\nOr run: npm run apple-pay:register");
  console.log("\nAfter registration, test Apple Pay on Safari at /checkout.");
} catch (error) {
  console.error("\nFAIL: Could not reach verification URL.");
  console.error(error instanceof Error ? error.message : error);
  printSetupSteps(domain, isSandbox);
  process.exit(1);
}

function printSetupSteps(domain, isSandbox) {
  console.log("\nSetup steps:");
  console.log("- Deploy latest code (includes PayPal sandbox domain file)");
  console.log(`- Register ${domain} in PayPal Apple Pay settings`);
  if (isSandbox) {
    console.log("- Sandbox: https://www.sandbox.paypal.com/businessmanage/account/payments");
  }
  console.log("- Run again: npm run apple-pay:check");
}
