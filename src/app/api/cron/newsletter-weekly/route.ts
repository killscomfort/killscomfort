import { NextResponse } from "next/server";
import { createWeeklyNewsletterDraftFromEvents } from "@/lib/newsletter-drafts";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Monday cron: create a weekly Miami events draft for admin review.
 * Does NOT auto-send — you approve + Send in /admin/newsletter/drafts.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();
    const draft = await createWeeklyNewsletterDraftFromEvents(supabase, {
      status: "in_review",
      notify: true,
    });

    return NextResponse.json({
      ok: true,
      draft,
      message:
        "Draft created at in_review. Open /admin/newsletter/drafts to edit and send.",
    });
  } catch (error) {
    console.error("[cron/newsletter-weekly]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create draft",
      },
      { status: 500 }
    );
  }
}
