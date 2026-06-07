import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { inquirySchema, simpleInquirySchema } from "@/lib/validations";
import {
  sendInquiryNotification,
  sendInquiryConfirmation,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = body.simplified ? simpleInquirySchema : inquirySchema;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parsed.data;
    let saved = false;

    if (isSupabaseConfigured()) {
      const supabase = await createServiceClient();
      const { error: dbError } = await supabase.from("inquiries").insert({
        name: data.name,
        email: data.email,
        event_type: data.event_type,
        phone: "phone" in data ? data.phone || null : null,
        event_date: data.event_date || null,
        event_location:
          "event_location" in data ? data.event_location || null : null,
        budget_range: "budget_range" in data ? data.budget_range || null : null,
        message: data.message || null,
        source: data.source || "website",
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
      });

      if (dbError) {
        console.error("DB error:", dbError);
        return NextResponse.json(
          { message: "Failed to save inquiry. Please try again or email us directly." },
          { status: 500 }
        );
      }

      saved = true;
    } else if (process.env.NODE_ENV === "development") {
      console.log("[dev] Inquiry received (Supabase not configured):", data);
      saved = true;
    } else {
      return NextResponse.json(
        {
          message:
            "Booking is temporarily unavailable. Please email Killscomfort@gmail.com directly.",
        },
        { status: 503 }
      );
    }

    await Promise.allSettled([
      sendInquiryNotification(parsed.data),
      sendInquiryConfirmation(parsed.data.name, parsed.data.email),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Inquiry error:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again or email Killscomfort@gmail.com." },
      { status: 500 }
    );
  }
}
