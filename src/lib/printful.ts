const PRINTFUL_API_BASE = "https://api.printful.com";

export type PrintfulRecipient = {
  name: string;
  email: string;
  phone?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state_code?: string | null;
  country_code: string;
  zip: string;
};

export type PrintfulLineItem = {
  variant_id: number;
  quantity: number;
  retail_price: string;
  name?: string;
};

export type CreatePrintfulOrderInput = {
  externalId: string;
  recipient: PrintfulRecipient;
  items: PrintfulLineItem[];
};

function getPrintfulApiKey() {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) {
    throw new Error("PRINTFUL_API_KEY is not configured");
  }
  return key;
}

/**
 * Printful order states that will never result in a shipment. An order sitting
 * in one of these is not evidence that fulfillment happened.
 */
const NON_SHIPPABLE_PRINTFUL_STATUSES = new Set([
  "canceled",
  "cancelled",
  "failed",
]);

/**
 * Look up an order Printful already has under this external_id.
 *
 * This is the guard against double-shipping. `createPrintfulOrder` posts with
 * `confirm: true`, so an accepted order is submitted for production immediately.
 * If the webhook run dies AFTER Printful accepts but BEFORE we persist the
 * returned id, the fulfillment record still reads "processing" — and a Stripe
 * retry that reclaims the stale lock would post the same order a second time.
 * Printful ships and bills twice; nothing in our DB shows it.
 *
 * Returns null when no such order exists (404), so callers can proceed to create.
 */
export async function findPrintfulOrderByExternalId(externalId: string) {
  const apiKey = getPrintfulApiKey();
  const response = await fetch(
    `${PRINTFUL_API_BASE}/orders/@${encodeURIComponent(externalId)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    }
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    // Don't treat an unreadable lookup as "safe to create" — that would
    // reintroduce the duplicate. Let the caller fail and retry.
    throw new Error(
      `Printful order lookup failed (${response.status} ${response.statusText})`
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { result?: { id?: number; external_id?: string; status?: string } }
    | null;

  const printfulOrderId = payload?.result?.id;
  if (!printfulOrderId) return null;

  // A canceled or failed Printful order will never ship. Treating one as an
  // existing order would let the caller report success and mark the fulfillment
  // record "fulfilled" with a real-looking Printful ID attached — a silent
  // false success that no audit query catches, because the ID is not null.
  // Return null so the caller creates a fresh order instead.
  const status = payload?.result?.status?.toLowerCase();
  if (status && NON_SHIPPABLE_PRINTFUL_STATUSES.has(status)) {
    console.warn("[printful] existing order is not shippable, ignoring", {
      externalId,
      printfulOrderId,
      status,
    });
    return null;
  }

  return {
    printfulOrderId: String(printfulOrderId),
    externalId: payload?.result?.external_id || externalId,
  };
}

export async function createPrintfulOrder(input: CreatePrintfulOrderInput) {
  const apiKey = getPrintfulApiKey();

  // Idempotency: if a previous run already got this order into Printful, reuse
  // it instead of creating a second confirmed order.
  const existing = await findPrintfulOrderByExternalId(input.externalId);
  if (existing) {
    console.warn("[printful] order already exists for external_id, reusing", {
      externalId: input.externalId,
      printfulOrderId: existing.printfulOrderId,
    });
    return existing;
  }

  const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: input.externalId,
      confirm: true,
      recipient: input.recipient,
      items: input.items,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        code?: number;
        result?: { id?: number; external_id?: string };
        error?: { reason?: string; message?: string };
      }
    | null;

  if (!response.ok) {
    console.error("[printful] create order failed", {
      status: response.status,
      statusText: response.statusText,
      externalId: input.externalId,
      payload,
    });
    throw new Error(
      `Printful order create failed (${response.status} ${response.statusText})`
    );
  }

  const printfulOrderId = payload?.result?.id;
  if (!printfulOrderId) {
    console.error("[printful] missing order id in response", {
      externalId: input.externalId,
      payload,
    });
    throw new Error("Printful order response missing id");
  }

  return {
    printfulOrderId: String(printfulOrderId),
    externalId: payload?.result?.external_id || input.externalId,
  };
}
