import { NextRequest, NextResponse } from "next/server";
import { unsubscribeNewsletterByToken } from "@/lib/newsletter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ message: "Invalid unsubscribe link." }, { status: 400 });
    }

    const result = await unsubscribeNewsletterByToken(token);

    if (!result.ok) {
      if (result.code === "invalid_token") {
        return NextResponse.json(
          { message: "This unsubscribe link is invalid or has expired." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Could not unsubscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: result.email,
      alreadyUnsubscribed: result.alreadyUnsubscribed,
    });
  } catch (err) {
    console.error("Newsletter unsubscribe error:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
