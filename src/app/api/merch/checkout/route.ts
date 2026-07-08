import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  productBySlug,
  skuFor,
  SHIPPING_OPTIONS,
  type MerchColor,
} from "@/config/merch.config";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

interface CartItem {
  slug: string;
  color: MerchColor;
  size: string;
  quantity: number;
}

/**
 * POST /api/merch/checkout
 * Body: { items: CartItem[] }
 * Returns: { url } — Stripe Checkout URL
 *
 * Prices are always taken from server config, never from the client.
 */
export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: CartItem[] };
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const skuMeta: { sku: string; slug: string; color: string; size: string; qty: number; unit: number }[] = [];

    for (const item of items) {
      const product = productBySlug(item.slug);
      if (!product) return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
      if (!product.colors.includes(item.color) || !product.sizes.includes(item.size)) {
        return NextResponse.json({ error: `Invalid variant for ${item.slug}` }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(10, Math.floor(item.quantity || 1)));
      const sku = skuFor(product.slug, item.color, item.size);

      lineItems.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          product_data: {
            name: `${product.name} — ${item.color === "black" ? "Black" : "White"} / ${item.size}`,
            images: [`${process.env.NEXT_PUBLIC_SITE_URL}/merch/logo-chrome.png`],
            metadata: { sku },
          },
        },
      });
      skuMeta.push({ sku, slug: product.slug, color: item.color, size: item.size, qty, unit: product.priceCents });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "ES", "NL", "MX", "PR"],
      },
      shipping_options: SHIPPING_OPTIONS.map((s) => ({
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: s.label,
          fixed_amount: { amount: s.amountCents, currency: "usd" },
        },
      })),
      phone_number_collection: { enabled: true },
      metadata: {
        merch: "1",
        // Compact cart encoding for the webhook: sku:qty|sku:qty
        cart: skuMeta.map((m) => `${m.sku}:${m.qty}`).join("|"),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/merch?order=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/merch?order=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[merch/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
