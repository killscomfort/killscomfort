import Stripe from "stripe";

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(key && !key.includes("placeholder"));
}

export function getStripeClient() {
  if (!isStripeConfigured()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
