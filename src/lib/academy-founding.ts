import type { SupabaseClient } from "@supabase/supabase-js";

/** First N academy registry accounts unlock Full Spectrum for free. */
export const ACADEMY_FOUNDING_MEMBER_LIMIT = 20;

/**
 * Counts academy registrants (profiles with a username) and grants
 * Full Spectrum when this user is within the founding cohort.
 */
export async function grantFoundingAcademyAccessIfEligible(
  admin: SupabaseClient,
  input: { userId: string; email: string; username: string }
): Promise<{ founding: boolean; cohortSize: number }> {
  // Trigger may lag — upsert so username is present for counting.
  await admin.from("profiles").upsert(
    {
      id: input.userId,
      email: input.email,
      username: input.username,
    },
    { onConflict: "id" }
  );

  const { count, error: countError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .not("username", "is", null);

  if (countError) {
    console.error("[academy] founding cohort count failed", countError);
    return { founding: false, cohortSize: 0 };
  }

  const cohortSize = count ?? 0;
  const founding = cohortSize > 0 && cohortSize <= ACADEMY_FOUNDING_MEMBER_LIMIT;

  if (founding) {
    const { error: grantError } = await admin
      .from("profiles")
      .update({ has_full_access: true })
      .eq("id", input.userId);

    if (grantError) {
      console.error("[academy] founding access grant failed", grantError);
      return { founding: false, cohortSize };
    }
  }

  return { founding, cohortSize };
}
