import fs from "fs";
import path from "path";
import {
  PAYPAL_LIVE_APPLE_PAY_DOMAIN_ASSOCIATION,
  PAYPAL_SANDBOX_APPLE_PAY_DOMAIN_ASSOCIATION,
} from "@/lib/paypal-apple-pay-domains";

const DOMAIN_FILE_NAME = "apple-developer-merchantid-domain-association";

function getPayPalMode() {
  return (
    process.env.PAYPAL_MODE ||
    process.env.NEXT_PUBLIC_PAYPAL_MODE ||
    "sandbox"
  );
}

function getBuiltInDomainAssociation() {
  const mode = getPayPalMode();
  if (mode === "live") return PAYPAL_LIVE_APPLE_PAY_DOMAIN_ASSOCIATION;
  if (mode === "sandbox") return PAYPAL_SANDBOX_APPLE_PAY_DOMAIN_ASSOCIATION;
  return "";
}

function readDomainAssociationFile() {
  const fromEnv = process.env.APPLE_PAY_DOMAIN_ASSOCIATION?.trim();
  if (fromEnv) return fromEnv;

  const filePath =
    process.env.APPLE_PAY_DOMAIN_ASSOCIATION_FILE?.trim() ||
    path.join(process.cwd(), ".well-known", DOMAIN_FILE_NAME);

  try {
    const fromDisk = fs.readFileSync(filePath, "utf8").trim();
    if (fromDisk) return fromDisk;
  } catch {
    // fall through to PayPal's standard domain file for this environment
  }

  return getBuiltInDomainAssociation();
}

/** True when the PayPal/Apple domain verification file is available to serve. */
export function isApplePayEnabled() {
  return Boolean(readDomainAssociationFile());
}

export function getApplePayDomainAssociation() {
  return readDomainAssociationFile();
}

export function getApplePayDomainName(fallback = "www.killscomfort.com") {
  const configured = process.env.APPLE_PAY_DOMAIN_NAME?.trim();
  if (configured) return configured;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      // fall through
    }
  }

  return fallback;
}

export const APPLE_PAY_DOMAIN_FILE_PATH = `/.well-known/${DOMAIN_FILE_NAME}`;
