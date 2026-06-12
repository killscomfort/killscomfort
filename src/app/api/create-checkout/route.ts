import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SITE } from "@/lib/constants";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Donations are temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { amount, purpose } = body;

    if (!amount || typeof amount !== "number" || amount < 100) {
      return NextResponse.json(
        { error: "Minimum donation is $1.00" },
        { status: 400 }
      );
    }

    const purposeLabel =
      purpose === "rollout"
        ? "KillsComfort — Rollout Studio App"
        : "KillsComfort — General Support";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: purposeLabel,
              description:
                "Thank you for supporting KillsComfort. Every dollar goes directly into the music.",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      submit_type: "donate",
      success_url: `${SITE.url}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE.url}/donate`,
      metadata: {
        purpose: purpose === "rollout" ? "rollout" : "general",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
