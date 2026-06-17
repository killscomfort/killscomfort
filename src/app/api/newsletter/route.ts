import { NextRequest, NextResponse } from "next/server";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { newsletterSchema } from "@/lib/validations";
import {
  sendNewsletterConfirmation,
  sendNewsletterNotification,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        errors[key] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parsed.data;
    const normalizedEmail = data.email.toLowerCase();

    if (isSupabaseConfigured()) {
      const supabase = await createAnonClient();
      const { error: dbError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: normalizedEmail,
          source: data.source || "website",
          utm_source: data.utm_source || null,
          utm_medium: data.utm_medium || null,
          utm_campaign: data.utm_campaign || null,
        });

      if (dbError) {
        if (dbError.code === "23505") {
          return NextResponse.json({ success: true, alreadySubscribed: true });
        }

        console.error("Newsletter DB error:", dbError);
        return NextResponse.json(
          { message: "Failed to subscribe. Please try again." },
          { status: 500 }
        );
      }
    } else if (process.env.NODE_ENV === "development") {
      console.log("[dev] Newsletter signup (Supabase not configured):", {
        ...data,
        email: normalizedEmail,
      });
    } else {
      return NextResponse.json(
        { message: "Newsletter signup is temporarily unavailable." },
        { status: 503 }
      );
    }

    await Promise.allSettled([
      sendNewsletterNotification(normalizedEmail, data.source),
      sendNewsletterConfirmation(normalizedEmail),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
