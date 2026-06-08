#!/usr/bin/env node

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.killscomfort.com";
const domain = process.env.APPLE_PAY_DOMAIN_NAME || new URL(siteUrl).hostname;
const fileUrl = `${siteUrl.replace(/\/$/, "")}/.well-known/apple-developer-merchantid-domain-association`;

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

  if (response.status >= 300 && response.status < 400) {
    console.error("\nFAIL: Apple rejects redirects for the verification file.");
    console.error("Host the file directly on the domain you register in PayPal.");
    process.exit(1);
  }

  if (response.status !== 200) {
    console.error("\nFAIL: Verification file is not live yet.");
    printSetupSteps(domain);
    process.exit(1);
  }

  if (contentType.includes("text/html")) {
    console.error("\nFAIL: File is returning HTML instead of the verification file.");
    printSetupSteps(domain);
    process.exit(1);
  }

  if (body.length < 20) {
    console.error("\nFAIL: Verification file looks empty.");
    printSetupSteps(domain);
    process.exit(1);
  }

  console.log("\nOK: Verification file is reachable.");
  console.log("\nNext: register the domain in PayPal if you have not already:");
  console.log("1. https://developer.paypal.com/dashboard/ → Sandbox → Apps & Credentials");
  console.log("2. Open your REST app → enable Apple Pay → Add Domain");
  console.log(`3. Register ${domain} (use www if checkout runs on www)`);
  console.log("4. Or: https://www.sandbox.paypal.com/businessmanage/account/payments → Manage Apple Pay");
} catch (error) {
  console.error("\nFAIL: Could not reach verification URL.");
  console.error(error instanceof Error ? error.message : error);
  printSetupSteps(domain);
  process.exit(1);
}

function printSetupSteps(domain) {
  console.log("\nSetup steps:");
  console.log("1. PayPal Sandbox → Payment Methods → Manage Apple Pay → Add Domain");
  console.log("2. Download apple-developer-merchantid-domain-association (no file extension)");
  console.log("3. Add it to this project as .well-known/apple-developer-merchantid-domain-association");
  console.log("   OR set APPLE_PAY_DOMAIN_ASSOCIATION in Vercel with the full file contents");
  console.log(`4. Set APPLE_PAY_DOMAIN_NAME=${domain} if needed`);
  console.log(`5. Register ${domain} in PayPal, then redeploy and run: npm run apple-pay:check");
}
