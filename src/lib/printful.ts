/**
 * Minimal Printful API client (v1 REST).
 * Docs: https://developers.printful.com
 *
 * Env:
 *   PRINTFUL_API_KEY   — private token from Printful → Settings → API
 *   PRINTFUL_STORE_ID  — numeric store id (required for account-level tokens)
 */

const PRINTFUL_BASE = "https://api.printful.com";

function headers(): HeadersInit {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) throw new Error("PRINTFUL_API_KEY is not set");
  const h: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (process.env.PRINTFUL_STORE_ID) {
    h["X-PF-Store-Id"] = process.env.PRINTFUL_STORE_ID;
  }
  return h;
}

async function pf<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `Printful ${path} failed (${res.status}): ${JSON.stringify(json?.error ?? json)}`
    );
  }
  return json.result as T;
}

// --- Sync products (created once in the Printful dashboard) -----------------

export interface PrintfulSyncVariant {
  id: number;
  sku: string | null;
  name: string;
  retail_price: string;
}

export interface PrintfulSyncProduct {
  id: number;
  name: string;
}

export async function listSyncProducts(): Promise<PrintfulSyncProduct[]> {
  return pf<PrintfulSyncProduct[]>("/store/products?limit=100");
}

export async function getSyncProduct(
  id: number
): Promise<{ sync_product: PrintfulSyncProduct; sync_variants: PrintfulSyncVariant[] }> {
  return pf(`/store/products/${id}`);
}

// --- Orders ------------------------------------------------------------------

export interface PrintfulRecipient {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
  email?: string;
  phone?: string;
}

export interface PrintfulOrderItem {
  sync_variant_id: number;
  quantity: number;
}

export interface PrintfulOrder {
  id: number;
  status: string;
  dashboard_url?: string;
}

/**
 * Create a Printful order. `confirm=true` sends it straight to fulfillment
 * (this is what makes the pipeline hands-off). Set DRY_RUN_PRINTFUL=1 in
 * env to create drafts instead while testing.
 */
export async function createOrder(
  recipient: PrintfulRecipient,
  items: PrintfulOrderItem[],
  externalId: string
): Promise<PrintfulOrder> {
  const confirm = process.env.DRY_RUN_PRINTFUL === "1" ? "0" : "1";
  return pf<PrintfulOrder>(`/orders?confirm=${confirm}`, {
    method: "POST",
    body: JSON.stringify({
      external_id: externalId,
      recipient,
      items,
    }),
  });
}

export async function getOrder(id: number): Promise<PrintfulOrder> {
  return pf<PrintfulOrder>(`/orders/${id}`);
}

// --- Legacy catalog API (variant_id orders, pre-expansion merch flow) --------

export type LegacyPrintfulRecipient = {
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

export type LegacyPrintfulLineItem = {
  variant_id: number;
  quantity: number;
  retail_price: string;
  name?: string;
};

export type CreatePrintfulOrderInput = {
  externalId: string;
  recipient: LegacyPrintfulRecipient;
  items: LegacyPrintfulLineItem[];
};

export async function createPrintfulOrder(input: CreatePrintfulOrderInput) {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) throw new Error("PRINTFUL_API_KEY is not configured");

  const response = await fetch(`${PRINTFUL_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(process.env.PRINTFUL_STORE_ID
        ? { "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID }
        : {}),
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
    throw new Error("Printful order response missing id");
  }

  return {
    printfulOrderId: String(printfulOrderId),
    externalId: payload?.result?.external_id || input.externalId,
  };
}
