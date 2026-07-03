import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import {
  sendOrderConfirmation,
  sendOrderNotification,
} from "@/lib/orders/email";
import type { ValidatedOrderItem } from "@/lib/orders/helpers";
import { z } from "zod";

const captureSchema = z.object({
  orderId: z.string().uuid(),
  paypalOrderId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { message: "Checkout is not configured." },
        { status: 503 }
      );
    }

    const parsed = captureSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid capture request." }, { status: 400 });
    }

    const { orderId, paypalOrderId } = parsed.data;
    const supabase = await createServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
      });
    }

    if (order.paypal_order_id !== paypalOrderId) {
      return NextResponse.json({ message: "PayPal order mismatch." }, { status: 400 });
    }

    const capture = await capturePayPalOrder(paypalOrderId, order.total_cents);
    const capturePayment = capture.purchase_units?.[0]?.payments?.captures?.[0];

    if (capture.status !== "COMPLETED" || !capturePayment) {
      await supabase
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      return NextResponse.json(
        { message: "Payment could not be completed." },
        { status: 402 }
      );
    }

    const paidCents = Math.round(Number(capturePayment.amount.value) * 100);
    if (paidCents !== order.total_cents) {
      console.error("PayPal amount mismatch", { paidCents, expected: order.total_cents });
      return NextResponse.json({ message: "Payment amount mismatch." }, { status: 400 });
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    await supabase
      .from("orders")
      .update({
        status: "paid",
        paypal_capture_id: capturePayment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    const items = (orderItems || []).map((item) => ({
      product_slug: item.product_slug,
      product_name: item.product_name,
      price_cents: item.price_cents,
      quantity: item.quantity,
      size: item.size,
      line_total_cents: item.price_cents * item.quantity,
    })) as ValidatedOrderItem[];

    const shipping = order.shipping_address as {
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      event_date?: string | null;
      event_notes?: string | null;
    };

    const emailPayload = {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shipping,
      items,
      totalCents: order.total_cents,
    };

    const [notificationResult, confirmationResult] = await Promise.all([
      sendOrderNotification(emailPayload),
      sendOrderConfirmation(emailPayload),
    ]);

    if (!notificationResult.ok && !notificationResult.skipped) {
      console.error("[email] Admin order notification failed:", notificationResult.error);
    }
    if (!confirmationResult.ok && !confirmationResult.skipped) {
      console.error("[email] Customer confirmation failed:", confirmationResult.error);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("Capture order error:", error);
    return NextResponse.json(
      { message: "Payment capture failed. Contact support if you were charged." },
      { status: 500 }
    );
  }
}
