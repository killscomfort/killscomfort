// POST /api/stripe/checkout — creates a Stripe Checkout session
// for the one-time "Full Spectrum" purchase.
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: 'add_email_first' }, { status: 403 }); // guest sessions must convert before buying

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    allow_promotion_codes: true, // discount codes created in the Stripe dashboard
    line_items: [{ price: process.env.STRIPE_FULL_SPECTRUM_PRICE_ID!, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/academy/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/academy/dashboard`,
  });
  return NextResponse.json({ url: session.url });
}
