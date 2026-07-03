const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function getPayPalClientId() {
  return (
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID ||
    ""
  );
}

export function isPayPalMock() {
  return (
    process.env.PAYPAL_MODE === "mock" && process.env.NODE_ENV === "development"
  );
}

export function isPayPalConfigured() {
  if (isPayPalMock()) return true;

  return Boolean(getPayPalClientId() && process.env.PAYPAL_CLIENT_SECRET);
}

export function createMockCapture(totalCents: number, paypalOrderId: string) {
  const value = (totalCents / 100).toFixed(2);

  return {
    id: paypalOrderId,
    status: "COMPLETED",
    purchase_units: [
      {
        payments: {
          captures: [
            {
              id: `MOCK-CAPTURE-${paypalOrderId}`,
              status: "COMPLETED",
              amount: { value },
            },
          ],
        },
      },
    ],
  };
}

async function getAccessToken() {
  const clientId = getPayPalClientId();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(params: {
  orderId: string;
  totalCents: number;
  items: { name: string; quantity: number; unitAmountCents: number }[];
}) {
  if (isPayPalMock()) {
    return { id: `MOCK-${params.orderId}` };
  }

  const token = await getAccessToken();
  const value = (params.totalCents / 100).toFixed(2);

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.orderId,
          amount: {
            currency_code: "USD",
            value,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value,
              },
            },
          },
          items: params.items.map((item) => ({
            name: item.name.slice(0, 127),
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: "USD",
              value: (item.unitAmountCents / 100).toFixed(2),
            },
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("PayPal create order error:", data);
    throw new Error("Failed to create PayPal order");
  }

  return data as { id: string };
}

export async function capturePayPalOrder(
  paypalOrderId: string,
  totalCents?: number
) {
  if (isPayPalMock()) {
    if (!totalCents) {
      throw new Error("Mock capture requires order total");
    }
    return createMockCapture(totalCents, paypalOrderId);
  }

  const token = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    console.error("PayPal capture error:", data);
    throw new Error("Failed to capture PayPal payment");
  }

  return data as {
    id: string;
    status: string;
    purchase_units: {
      payments?: {
        captures?: { id: string; status: string; amount: { value: string } }[];
      };
    }[];
  };
}
