import type { SupabaseClient } from "@supabase/supabase-js";

type SaveInput = {
  username: string;
  email: string | null;
  score: number;
  character: "boy" | "girl" | null;
};

type SaveResult = {
  stored: boolean;
  reason?: string;
  updated?: boolean;
};

type ExistingRow = {
  id: string;
  score: number;
  username: string;
  username_key?: string | null;
};

function usernameKey(username: string) {
  return username.trim().toLowerCase();
}

async function findExisting(
  supabase: SupabaseClient,
  key: string,
): Promise<ExistingRow | null> {
  const { data: byKey, error: keyError } = await supabase
    .from("street_run_scores")
    .select("id, score, username, username_key")
    .eq("username_key", key)
    .maybeSingle();

  if (!keyError && byKey) return byKey as ExistingRow;

  const { data: rows, error: listError } = await supabase
    .from("street_run_scores")
    .select("id, score, username, username_key");

  if (listError) throw listError;

  const match = (rows as ExistingRow[] | null)?.find(
    (row) => row.username?.trim().toLowerCase() === key,
  );
  return match ?? null;
}

export async function upsertStreetRunScore(
  supabase: SupabaseClient,
  input: SaveInput,
): Promise<SaveResult> {
  const name = input.username.trim();
  const key = usernameKey(name);

  const existing = await findExisting(supabase, key);
  if (existing && input.score <= existing.score) {
    return { stored: false, reason: "not_personal_best" };
  }

  const payload: Record<string, unknown> = {
    username: name,
    score: input.score,
    character: input.character,
    username_key: key,
  };

  if (input.email) {
    payload.email = input.email;
  }

  if (existing) {
    const updatePayload: Record<string, unknown> = {
      username: name,
      score: input.score,
      character: input.character,
      created_at: new Date().toISOString(),
      username_key: key,
    };
    if (input.email) updatePayload.email = input.email;

    let { error } = await supabase
      .from("street_run_scores")
      .update(updatePayload)
      .eq("id", existing.id);

    if (error?.code === "42703") {
      delete updatePayload.username_key;
      ({ error } = await supabase
        .from("street_run_scores")
        .update(updatePayload)
        .eq("id", existing.id));
    }

    if (error) throw error;
    return { stored: true, updated: true };
  }

  let { error } = await supabase.from("street_run_scores").insert(payload);

  if (error?.code === "42703") {
    delete payload.username_key;
    ({ error } = await supabase.from("street_run_scores").insert(payload));
  }

  if (error?.code === "23502" && !payload.email) {
    payload.email = `${key}@street-run.players`;
    ({ error } = await supabase.from("street_run_scores").insert(payload));
  }

  if (error) throw error;
  return { stored: true, updated: false };
}

export function dedupeLeaderboardRows<
  T extends { username: string; score: number; created_at: string },
>(rows: T[]): T[] {
  const best = new Map<string, T>();
  for (const row of rows) {
    const key = row.username.trim().toLowerCase();
    const current = best.get(key);
    if (!current || row.score > current.score) {
      best.set(key, row);
    } else if (current && row.score === current.score && row.created_at < current.created_at) {
      best.set(key, row);
    }
  }
  return [...best.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.created_at.localeCompare(b.created_at);
  });
}
