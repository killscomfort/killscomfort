import { NextRequest, NextResponse } from "next/server";
import { streetRunScoreSchema } from "@/lib/street-run";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/server";

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

    const supabase = await createAnonClient();
    const { data, error } = await supabase.rpc("upsert_street_run_score", {
      p_username: username.trim(),
      p_email: emailValue,
      p_score: score,
      p_character: character ?? null,
    });

    if (error) {
      console.error("[street-run/scores POST] rpc failed:", error);
      if (error.code === "42883") {
        return NextResponse.json(
          { message: "Leaderboard is not fully set up yet. Run the latest SQL migration." },
          { status: 503 },
        );
      }
      throw error;
    }

    const result = (data ?? {}) as {
      ok?: boolean;
      stored?: boolean;
      reason?: string;
      error?: string;
    };

    if (result.ok === false) {
      return NextResponse.json(
        { message: result.error === "invalid_username" ? "Invalid username." : "Could not save score." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      stored: Boolean(result.stored),
      reason: result.reason,
    });
  } catch (err) {
    console.error("[street-run/scores POST]", err);
    return NextResponse.json({ message: "Could not save score." }, { status: 500 });
  }
}
