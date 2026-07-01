import { NextRequest, NextResponse } from "next/server";
import { streetRunScoreSchema } from "@/lib/street-run";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 10)));

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ scores: [] });
  }

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("street_run_scores")
      .select("email, score, character, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ scores: data ?? [] });
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

    const { email, score, character } = parsed.data;

    if (!isSupabaseConfigured()) {
      if (process.env.NODE_ENV === "development") {
        console.log("[dev] Street run score:", { email, score, character });
        return NextResponse.json({ success: true, stored: false });
      }
      return NextResponse.json(
        { message: "Leaderboard is temporarily unavailable." },
        { status: 503 },
      );
    }

    const supabase = await createServiceClient();
    const { error } = await supabase.from("street_run_scores").insert({
      email: email.toLowerCase().trim(),
      score,
      character: character ?? null,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, stored: true });
  } catch (err) {
    console.error("[street-run/scores POST]", err);
    return NextResponse.json({ message: "Could not save score." }, { status: 500 });
  }
}
