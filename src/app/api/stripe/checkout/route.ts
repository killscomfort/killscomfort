// POST /api/stripe/checkout — creates a Stripe Checkout session
// for the one-time "Full Spectrum" purchase.
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  const priceId = process.env.STRIPE_FULL_SPECTRUM_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!priceId || !siteUrl || !stripeKey) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  if (!user.email) {
    // guest sessions must convert before buying
    return NextResponse.json({ error: "add_email_first" }, { status: 403 });
  }

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: {
      type: "academy",
      product: "full_spectrum",
      user_id: user.id,
    },
    success_url: `${siteUrl}/academy/dashboard?upgraded=1`,
    cancel_url: `${siteUrl}/academy/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
