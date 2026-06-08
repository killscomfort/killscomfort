import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { sendOrderEmailTest } from "@/lib/orders/email";
import { getResendClient } from "@/lib/resend-client";

/** Admin-only: verify Resend is wired up. POST { "to": "you@example.com" } */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && !getResendClient()) {
    return NextResponse.json(
      { message: "RESEND_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { to?: string };
  const to = body.to?.trim();
  if (!to) {
    return NextResponse.json({ message: "Provide { to: email } in body." }, { status: 400 });
  }

  const result = await sendOrderEmailTest(to);
  const ok = result.admin.ok && result.customer.ok;

  return NextResponse.json({
    ok,
    from: result.from,
    admin: result.admin,
    customer: result.customer,
  }, { status: ok ? 200 : 502 });
}
