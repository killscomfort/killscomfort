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

export async function createPrintfulOrder(input: CreatePrintfulOrderInput) {
  const apiKey = getPrintfulApiKey();
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
