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
  const serviceCheckout = paypal ? "paypal" : "unavailable";
  const donations = stripe ? "stripe" : "unavailable";

  return NextResponse.json({
    ok: merchCheckout !== "unavailable" || serviceCheckout !== "unavailable",
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
