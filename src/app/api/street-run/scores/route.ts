import { NextRequest, NextResponse } from "next/server";
import { dedupeLeaderboardRows, formatDbError, upsertStreetRunScore } from "@/lib/street-run-db";
import { streetRunScoreSchema } from "@/lib/street-run";
import { createAnonClient, createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 10)));

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ scores: [] });
  }

  try {
    const supabase = await createAnonClient();
    const { data, error } = await supabase
      .from("street_run_scores")
      .select("username, score, character, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(Math.max(limit, limit * 3));

    if (error) throw error;
    const scores = dedupeLeaderboardRows(data ?? []).slice(0, limit);
    return NextResponse.json({ scores });
  } catch (err) {
    console.error("[street-run/scores GET]", err);
    return NextResponse.json({ scores: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = streetRunScoreSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "form");
        errors[key] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { username, email, score, character } = parsed.data;
    const emailValue = email?.trim() ? email.trim().toLowerCase() : null;

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[dev] Street run score:", { username, email: emailValue, score, character });
        return NextResponse.json({ success: true, stored: false });
      }
      return NextResponse.json(
        { message: "Leaderboard is temporarily unavailable." },
        { status: 503 },
      );
    }

    const payload = {
      username: username.trim(),
      email: emailValue,
      score: Math.floor(score),
      character: character ?? null,
    };

    let lastError: unknown = null;

    try {
      const supabase = await createServiceClient();
      const result = await upsertStreetRunScore(supabase, payload);
      return NextResponse.json({ success: true, stored: result.stored, reason: result.reason });
    } catch (err) {
      lastError = err;
      console.error("[street-run/scores POST] service client failed:", err);
    }

    try {
      const supabase = await createAnonClient();
      const result = await upsertStreetRunScore(supabase, payload);
      return NextResponse.json({ success: true, stored: result.stored, reason: result.reason });
    } catch (err) {
      lastError = err;
      console.error("[street-run/scores POST] anon client failed:", err);
    }

    return NextResponse.json({ message: formatDbError(lastError) }, { status: 500 });
  } catch (err) {
    console.error("[street-run/scores POST]", err);
    return NextResponse.json({ message: formatDbError(err) }, { status: 500 });
  }
}
