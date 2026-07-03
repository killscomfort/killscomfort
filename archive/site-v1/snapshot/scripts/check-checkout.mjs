#!/usr/bin/env node
/**
 * Check checkout configuration locally or on production.
 * Usage:
 *   node scripts/check-checkout.mjs
 *   node scripts/check-checkout.mjs https://www.killscomfort.com
 */
const baseUrl = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

async function check(name, fn) {
  try {
    const result = await fn();
    const ok = Boolean(result.ok);
    console.log(`${ok ? "OK" : "FAIL"}  ${name}`);
    if (result.detail) console.log(`     ${result.detail}`);
    return ok;
  } catch (error) {
    console.log(`FAIL  ${name}`);
    console.log(`     ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function fetchJson(path, init) {
  const res = await fetch(`${baseUrl}${path}`, init);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { res, data };
}

async function main() {
  console.log(`Checking checkout at ${baseUrl}\n`);

  const results = [];

  results.push(
    await check("Checkout status", async () => {
      const { res, data } = await fetchJson("/api/checkout/status");
      if (!res.ok) {
        return { ok: false, detail: `HTTP ${res.status}` };
      }

      const detail = [
        `merch=${data.flows?.merch}`,
        `services=${data.flows?.services}`,
        `donations=${data.flows?.donations}`,
        `stripe=${data.stripe}`,
        `paypal=${data.paypal}`,
      ].join(", ");

      return {
        ok: data.ok,
        detail,
      };
    })
  );

  results.push(
    await check("Merch Stripe session", async () => {
      const { res, data } = await fetchJson("/api/cart-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ slug: "diamond-hoodie", quantity: 1, size: "M" }],
        }),
      });

      if (res.status === 503) {
        return {
          ok: false,
          detail: data.error || "Stripe not configured (STRIPE_SECRET_KEY missing)",
        };
      }

      if (!res.ok) {
        return { ok: false, detail: data.error || `HTTP ${res.status}` };
      }

      return {
        ok: Boolean(data.url),
        detail: data.url ? "Stripe session URL returned" : "Missing session URL",
      };
    })
  );

  results.push(
    await check("Service PayPal order", async () => {
      const { res, data } = await fetchJson("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: "Checkout Check",
          customer_email: "checkout-check@example.com",
          customer_phone: "3055550100",
          items: [{ slug: "private-lesson", quantity: 1 }],
        }),
      });

      if (res.status === 503) {
        return {
          ok: false,
          detail: data.message || "PayPal not configured",
        };
      }

      if (!res.ok) {
        return { ok: false, detail: data.message || `HTTP ${res.status}` };
      }

      return {
        ok: Boolean(data.paypalOrderId),
        detail: data.paypalOrderId ? `Order ${data.orderNumber}` : "Missing PayPal order id",
      };
    })
  );

  results.push(
    await check("Donation Stripe session", async () => {
      const { res, data } = await fetchJson("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500, purpose: "general" }),
      });

      if (res.status === 503) {
        return {
          ok: false,
          detail: data.error || "Stripe not configured (STRIPE_SECRET_KEY missing)",
        };
      }

      if (!res.ok) {
        return { ok: false, detail: data.error || `HTTP ${res.status}` };
      }

      return {
        ok: Boolean(data.url),
        detail: data.url ? "Donation session URL returned" : "Missing session URL",
      };
    })
  );

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} checks passed.`);

  if (passed < results.length) {
    console.log("\nIf Stripe checks failed on production, add STRIPE_SECRET_KEY in Vercel env vars and redeploy.");
    process.exit(1);
  }
}

main();
