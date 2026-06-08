export function getPublicPayPalClientId() {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
}

export function getPayPalEnvironment(): "sandbox" | "production" {
  const mode =
    process.env.NEXT_PUBLIC_PAYPAL_MODE || process.env.PAYPAL_MODE || "sandbox";
  return mode === "live" ? "production" : "sandbox";
}

export function getGooglePayEnvironment(): "TEST" | "PRODUCTION" {
  return getPayPalEnvironment() === "production" ? "PRODUCTION" : "TEST";
}

export function formatPayPalAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export const PAYPAL_CHECKOUT_COMPONENTS = [
  "paypal-payments",
  "paypal-guest-payments",
  "venmo-payments",
  "googlepay-payments",
  "applepay-payments",
  "card-fields",
] as const;

/** PayPal, Venmo, and debit/credit cards (guest checkout). */
export const PAYPAL_STANDARD_COMPONENTS = [
  "paypal-payments",
  "paypal-guest-payments",
  "venmo-payments",
] as const;

declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments: () => boolean;
    };
    google?: {
      payments?: {
        api?: unknown;
      };
    };
  }
}

export function canUseApplePay() {
  try {
    return (
      typeof window !== "undefined" &&
      !!window.ApplePaySession?.canMakePayments()
    );
  } catch {
    return false;
  }
}
