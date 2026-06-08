import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createPayPalOrder, isPayPalConfigured, isPayPalMock } from "@/lib/paypal";
import { checkoutSchema } from "@/lib/orders/validation";
import {
  buildOrderItems,
  buildShippingAddress,
  calculateOrderTotal,
  createOrderNumber,
} from "@/lib/orders/helpers";

export async function POST(request: NextRequest) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { message: "Checkout is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path.join(".") || "form";
        errors[key] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parsed.data;
    const items = buildOrderItems(data.items);
    const totalCents = calculateOrderTotal(items);
    const orderNumber = createOrderNumber();
    const supabase = await createServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || null,
        shipping_address: buildShippingAddress(data),
        subtotal_cents: totalCents,
        total_cents: totalCents,
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { message: "Could not create order. Please try again." },
        { status: 500 }
      );
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_slug: item.product_slug,
        product_name: item.product_name,
        price_cents: item.price_cents,
        quantity: item.quantity,
        size: item.size,
      }))
    );

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { message: "Could not save order items. Please try again." },
        { status: 500 }
      );
    }

    const paypalOrder = await createPayPalOrder({
      orderId: order.id,
      totalCents,
      items: items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitAmountCents: item.price_cents,
      })),
    });

    await supabase
      .from("orders")
      .update({ paypal_order_id: paypalOrder.id })
      .eq("id", order.id);

    return NextResponse.json({
      id: paypalOrder.id,
      orderId: order.id,
      orderNumber: order.order_number,
      paypalOrderId: paypalOrder.id,
      demoMode: isPayPalMock(),
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { message: "Something went wrong starting checkout." },
      { status: 500 }
    );
  }
}
