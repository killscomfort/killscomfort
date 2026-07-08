import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

/**
 * Printful webhook: package_shipped, order_failed, order_canceled
 *
 * Register in Printful dashboard (Settings → Webhooks) or via API, pointing to:
 *   https://killscomfort.com/api/webhooks/printful?token=YOUR_PRINTFUL_WEBHOOK_TOKEN
 *
 * Printful doesn't sign payloads, so we gate with a secret query token.
 * Set PRINTFUL_WEBHOOK_TOKEN in env to any long random string.
 */

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!process.env.PRINTFUL_WEBHOOK_TOKEN || token !== process.env.PRINTFUL_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const type: string = payload?.type ?? "";
  const printfulOrderId: number | undefined = payload?.data?.order?.id;
  if (!printfulOrderId) return NextResponse.json({ received: true });

  const db = supabaseAdmin();
  const { data: order } = await db
    .from("merch_orders")
    .select("*")
    .eq("printful_order_id", printfulOrderId)
    .single();
  if (!order) return NextResponse.json({ received: true });

  if (type === "package_shipped") {
    const shipment = payload.data.shipment ?? {};
    await db
      .from("merch_orders")
      .update({
        status: "shipped",
        tracking_number: shipment.tracking_number ?? null,
        tracking_url: shipment.tracking_url ?? null,
      })
      .eq("id", order.id);

    if (order.email) {
      await getResend().emails.send({
        from: "KillsComfort <orders@killscomfort.com>",
        to: order.email,
        subject: "Your KillsComfort order shipped",
        html: `
          <div style="font-family:Helvetica,Arial,sans-serif;background:#0b0b0d;color:#e8e8ea;padding:32px;border-radius:12px">
            <h1 style="letter-spacing:2px;font-weight:800">KILLSCOMFORT</h1>
            <p>It's on the way.</p>
            ${shipment.tracking_url ? `<p><a href="${shipment.tracking_url}" style="color:#c9d4e3">Track your package →</a></p>` : ""}
            ${shipment.tracking_number ? `<p style="color:#9a9aa0">Tracking #: ${shipment.tracking_number}</p>` : ""}
          </div>`,
      }).catch((e) => console.error("[printful webhook] resend failed", e));
    }
  } else if (type === "order_failed") {
    await db
      .from("merch_orders")
      .update({ status: "failed", failure_reason: payload?.data?.reason ?? "printful_order_failed" })
      .eq("id", order.id);
  } else if (type === "order_canceled") {
    await db.from("merch_orders").update({ status: "canceled" }).eq("id", order.id);
  }

  return NextResponse.json({ received: true });
}
