import { NextResponse } from "next/server";
import { DEFAULT_RIDE_GAME_CONFIG } from "@/lib/game-config";
import { getRideGameConfig } from "@/lib/game-config-db";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ config: DEFAULT_RIDE_GAME_CONFIG });
  }

  try {
    const supabase = await createAnonClient();
    const config = await getRideGameConfig(supabase);
    return NextResponse.json({ config });
  } catch (err) {
    console.error("[game/config GET]", err);
    return NextResponse.json({ config: DEFAULT_RIDE_GAME_CONFIG });
  }
}
