import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_RIDE_GAME_CONFIG,
  rideGameConfigSchema,
  type RideGameConfig,
} from "@/lib/game-config";

const CONFIG_ROW_ID = "default";

export async function getRideGameConfig(
  supabase: SupabaseClient,
): Promise<RideGameConfig> {
  const { data, error } = await supabase
    .from("ride_game_config")
    .select("config")
    .eq("id", CONFIG_ROW_ID)
    .maybeSingle();

  if (error || !data?.config) {
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      console.error("[getRideGameConfig]", error.message);
    }
    return DEFAULT_RIDE_GAME_CONFIG;
  }

  const parsed = rideGameConfigSchema.safeParse(data.config);
  if (!parsed.success || Object.keys(data.config as object).length === 0) {
    return DEFAULT_RIDE_GAME_CONFIG;
  }

  return parsed.data;
}

export async function saveRideGameConfig(
  supabase: SupabaseClient,
  config: RideGameConfig,
): Promise<void> {
  const { error } = await supabase.from("ride_game_config").upsert({
    id: CONFIG_ROW_ID,
    config,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
