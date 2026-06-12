import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/lib/constants";
import { getMerchItem, isCartMerchItem } from "@/lib/merch";
import { getStripeClient } from "@/lib/stripe";

type CartLineInput = {
  slug: string;
  quantity: number;
  size?: string;
};

function validateMerchCart(items: unknown): CartLineInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const validated: CartLineInput[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid cart item");
    }

    const line = raw as CartLineInput;
    const item = getMerchItem(line.slug);
    if (!item) {
      throw new Error(`Item not found: ${line.slug}`);
    }
    if (!isCartMerchItem(item)) {
      throw new Error(`${item.name} is purchased on Etsy, not through cart checkout`);
    }

    const qty = Number(line.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      throw new Error(`Invalid quantity for ${item.name}`);
    }

    if (item.sizes?.length) {
      if (!line.size || !item.sizes.includes(line.size)) {
        throw new Error(`Select a valid size for ${item.name}`);
      }
    }

    validated.push({
      slug: line.slug,
      quantity: qty,
      size: line.size,
    });
  }

  return validated;
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const items = validateMerchCart(body.items);

    const lineItems = items.map((line) => {
      const item = getMerchItem(line.slug)!;
      const sizeLabel = line.size ? ` — Size ${line.size}` : "";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.name}${sizeLabel}`,
            description: item.description,
            images: item.image.startsWith("http")
              ? [item.image]
              : [`${SITE.url}${item.image}`],
          },
          unit_amount: item.priceCents,
        },
        quantity: line.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `${SITE.url}/merch/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE.url}/checkout`,
      metadata: {
        type: "merch",
        cart: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    console.error("Cart checkout error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
