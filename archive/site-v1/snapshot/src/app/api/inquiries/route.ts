import { NextRequest, NextResponse } from "next/server";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { inquirySchema, simpleInquirySchema } from "@/lib/validations";
import { getClientIp } from "@/lib/request-ip";
import {
  sendInquiryNotification,
  sendInquiryConfirmation,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const schema = body.simplified ? simpleInquirySchema : inquirySchema;
    const parsed = schema.safeParse(body);
    const visitorIp = getClientIp(request);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parsed.data;

    if (isSupabaseConfigured()) {
      const supabase = await createAnonClient();
      const { error: dbError } = await supabase.from("inquiries").insert({
        name: data.name,
        email: data.email,
        event_type: "General Inquiry",
        phone: "phone" in data ? data.phone || null : null,
        preferred_contact: data.preferred_contact,
        event_date: data.event_date || null,
        message: data.message || null,
        visitor_ip: visitorIp,
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
    } else if (process.env.NODE_ENV === "development") {
      console.log("[dev] Inquiry received (Supabase not configured):", {
        ...data,
        visitor_ip: visitorIp,
      });
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
      sendInquiryNotification(parsed.data, visitorIp),
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
