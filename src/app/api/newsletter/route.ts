import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validations";
import { subscribeNewsletter } from "@/lib/newsletter";
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
    const result = await subscribeNewsletter(data);

    if (!result.ok) {
      if (result.code === "not_configured") {
        if (process.env.NODE_ENV === "development") {
          console.log("[dev] Newsletter signup (Supabase not configured):", data);
          return NextResponse.json({ success: true });
        }

        return NextResponse.json(
          { message: "Newsletter signup is temporarily unavailable." },
          { status: 503 }
        );
      }

      if (result.code === "duplicate") {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }

      return NextResponse.json(
        { message: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    await Promise.allSettled([
      sendNewsletterNotification(result.subscriber.email, data.source),
      sendNewsletterConfirmation(
        result.subscriber.email,
        result.subscriber.unsubscribe_token
      ),
    ]);

    return NextResponse.json({
      success: true,
      reactivated: result.reactivated,
    });
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
