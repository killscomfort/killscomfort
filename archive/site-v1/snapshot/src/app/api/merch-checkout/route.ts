import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SITE } from "@/lib/constants";
import { getMerchItem } from "@/lib/merch";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { slug, size, quantity = 1 } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }

    const item = getMerchItem(slug);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (item.sizes?.length) {
      if (!size || typeof size !== "string" || !item.sizes.includes(size)) {
        return NextResponse.json({ error: "Select a valid size" }, { status: 400 });
      }
    }

    const sizeLabel = size ? ` — Size ${size}` : "";
    const productName = `${item.name}${sizeLabel}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: item.description,
              images: item.image.startsWith("http")
                ? [item.image]
                : [`${SITE.url}${item.image}`],
            },
            unit_amount: item.priceCents,
          },
          quantity: qty,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `${SITE.url}/merch/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE.url}/merch`,
      metadata: {
        type: "merch",
        slug: item.slug,
        size: size || "",
        quantity: String(qty),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Merch checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
