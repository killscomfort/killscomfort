import { NextResponse } from "next/server";
import {
  getApplePayDomainName,
  isApplePayEnabled,
  APPLE_PAY_DOMAIN_FILE_PATH,
} from "@/lib/apple-pay";

export const runtime = "nodejs";

export async function GET() {
  const domain = getApplePayDomainName();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${domain}`;
  const fileUrl = `${siteUrl.replace(/\/$/, "")}${APPLE_PAY_DOMAIN_FILE_PATH}`;
  const payPalMode =
    process.env.PAYPAL_MODE ||
    process.env.NEXT_PUBLIC_PAYPAL_MODE ||
    "sandbox";
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID ||
    "";

  let fileStatus: {
    ok: boolean;
    status: number;
    contentType: string;
    length: number;
  } = { ok: false, status: 0, contentType: "", length: 0 };

  try {
    const response = await fetch(fileUrl, { redirect: "manual" });
    const body = (await response.text()).trim();
    const contentType = response.headers.get("content-type") || "";
    fileStatus = {
      ok:
        response.status === 200 &&
        !contentType.includes("text/html") &&
        body.length > 100,
      status: response.status,
      contentType,
      length: body.length,
    };
  } catch {
    // leave defaults
  }

  const appUrl = clientId
    ? `https://developer.paypal.com/dashboard/applications/${payPalMode === "live" ? "live" : "sandbox"}/${clientId}`
    : null;

  return NextResponse.json({
    domainFileConfigured: isApplePayEnabled(),
    domainToRegister: domain,
    verificationFileUrl: fileUrl,
    verificationFile: fileStatus,
    payPalMode,
    payPalAppUrl: appUrl,
    readyForRealApplePay: payPalMode === "live" && fileStatus.ok,
    sandboxTestingNote:
      payPalMode !== "live"
        ? "Production uses PayPal sandbox. Real Apple Pay cards will not work — use Apple sandbox test cards in Wallet, or switch PAYPAL_MODE to live for real customers."
        : null,
    payPalRegistrationRequired:
      "Register the domain in PayPal Developer Dashboard → your app → Apple Pay → Manage → Add Domain. This cannot be done via API for direct merchants.",
  });
}
