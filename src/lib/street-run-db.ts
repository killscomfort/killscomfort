import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

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
};

function usernameKey(username: string) {
  return username.trim().toLowerCase();
}

function resolveEmail(key: string, email: string | null) {
  const trimmed = email?.trim().toLowerCase();
  if (trimmed && trimmed.includes("@")) return trimmed;
  return `${key}@street-run.players`;
}

export function formatDbError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const pg = err as PostgrestError;
    if (pg.code === "42501") {
      return "Leaderboard permissions need updating — run the latest SQL migration in Supabase.";
    }
    if (pg.code === "42703") {
      return "Leaderboard schema is out of date — run the username SQL migration in Supabase.";
    }
    return pg.message || "Could not save score.";
  }
  if (err instanceof Error) return err.message;
  return "Could not save score.";
}

async function findExisting(
  supabase: SupabaseClient,
  key: string,
): Promise<ExistingRow | null> {
  const { data: byKey, error: keyError } = await supabase
    .from("street_run_scores")
    .select("id, score, username")
    .eq("username_key", key)
    .maybeSingle();

  if (!keyError && byKey) return byKey as ExistingRow;

  const { data: rows, error: listError } = await supabase
    .from("street_run_scores")
    .select("id, score, username");

  if (listError) throw listError;

  return (
    (rows as ExistingRow[] | null)?.find((row) => row.username?.trim().toLowerCase() === key) ?? null
  );
}

async function writeRow(
  supabase: SupabaseClient,
  existing: ExistingRow | null,
  input: SaveInput,
  key: string,
  email: string,
): Promise<SaveResult> {
  const base = {
    username: input.username.trim(),
    score: input.score,
    character: input.character,
    email,
  };

  if (existing) {
    let { error } = await supabase
      .from("street_run_scores")
      .update({ ...base, username_key: key, created_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error?.code === "42703") {
      ({ error } = await supabase
        .from("street_run_scores")
        .update({ ...base, created_at: new Date().toISOString() })
        .eq("id", existing.id));
    }

    if (error) throw error;
    return { stored: true, updated: true };
  }

  let { error } = await supabase.from("street_run_scores").insert({
    ...base,
    username_key: key,
  });

  if (error?.code === "42703") {
    ({ error } = await supabase.from("street_run_scores").insert(base));
  }

  if (error) throw error;
  return { stored: true, updated: false };
}

export async function upsertStreetRunScore(
  supabase: SupabaseClient,
  input: SaveInput,
): Promise<SaveResult> {
  const name = input.username.trim();
  const key = usernameKey(name);
  const email = resolveEmail(key, input.email);

  const existing = await findExisting(supabase, key);
  if (existing && input.score <= existing.score) {
    return { stored: false, reason: "not_personal_best" };
  }

  return writeRow(supabase, existing, input, key, email);
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
