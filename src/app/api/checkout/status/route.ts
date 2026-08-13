import { NextResponse } from "next/server";
import { isPayPalConfigured } from "@/lib/paypal";
import { isStripeConfigured } from "@/lib/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  const stripe = isStripeConfigured();
  const paypal = isPayPalConfigured();
  const supabase = isSupabaseConfigured();
  const printful = Boolean(process.env.PRINTFUL_API_KEY?.trim());

  const merchCheckout = stripe ? "stripe" : paypal ? "paypal" : "unavailable";
  // Current /services offers are inquire-by-email only (no priced cart SKUs).
  const serviceCheckout = "inquiry";
  const donations = stripe ? "stripe" : "unavailable";

  return NextResponse.json({
    ok: merchCheckout !== "unavailable" || donations !== "unavailable",
    stripe,
    paypal,
    supabase,
    printful,
    flows: {
      merch: merchCheckout,
      services: serviceCheckout,
      donations,
    },
  });
}
