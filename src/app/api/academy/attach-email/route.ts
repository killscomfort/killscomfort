import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAcademyWelcomeEmail } from "@/lib/email";
import {
  createAnonClient,
  createClient,
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email(),
  /** Required when the email already belongs to an account — merges guest progress. */
  password: z.string().min(6).optional(),
});

type ProfileRow = {
  id: string;
  email: string | null;
  username: string | null;
  xp: number;
  streak_count: number;
  longest_streak: number | null;
  has_full_access: boolean;
};

async function findAuthUserIdByEmail(
  admin: Awaited<ReturnType<typeof createServiceClient>>,
  email: string
): Promise<string | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (profile?.id) return profile.id as string;

  // Fallback if profiles.email is stale — page through a small auth window.
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function mergeGuestIntoAccount(
  admin: Awaited<ReturnType<typeof createServiceClient>>,
  guestId: string,
  accountId: string
) {
  const { data: guest } = await admin
    .from("profiles")
    .select("id,email,username,xp,streak_count,longest_streak,has_full_access")
    .eq("id", guestId)
    .maybeSingle();
  const { data: account } = await admin
    .from("profiles")
    .select("id,email,username,xp,streak_count,longest_streak,has_full_access")
    .eq("id", accountId)
    .maybeSingle();

  const g = guest as ProfileRow | null;
  const a = account as ProfileRow | null;
  if (!a) throw new Error("Existing account profile missing.");

  // Move lesson completions (keep earliest score if both finished a lesson).
  const { data: guestProgress } = await admin
    .from("lesson_progress")
    .select("lesson_slug,score,completed_at")
    .eq("user_id", guestId);

  if (guestProgress?.length) {
    await admin.from("lesson_progress").upsert(
      guestProgress.map((row) => ({
        user_id: accountId,
        lesson_slug: row.lesson_slug,
        score: row.score,
        completed_at: row.completed_at,
      })),
      { onConflict: "user_id,lesson_slug", ignoreDuplicates: true }
    );
  }

  const { data: guestBadges } = await admin
    .from("user_badges")
    .select("badge_id,earned_at")
    .eq("user_id", guestId);

  if (guestBadges?.length) {
    await admin.from("user_badges").upsert(
      guestBadges.map((row) => ({
        user_id: accountId,
        badge_id: row.badge_id,
        earned_at: row.earned_at,
      })),
      { onConflict: "user_id,badge_id", ignoreDuplicates: true }
    );
  }

  await admin
    .from("profiles")
    .update({
      xp: Math.max(a.xp ?? 0, g?.xp ?? 0),
      streak_count: Math.max(a.streak_count ?? 0, g?.streak_count ?? 0),
      longest_streak: Math.max(a.longest_streak ?? 0, g?.longest_streak ?? 0),
      has_full_access: Boolean(a.has_full_access || g?.has_full_access),
    })
    .eq("id", accountId);

  // Guest row cascades away with the auth user.
  const { error: deleteError } = await admin.auth.admin.deleteUser(guestId);
  if (deleteError) {
    console.error("[academy/attach-email] guest delete failed", deleteError);
  }
}

/** Attach an email to a guest session without a confirmation link.
 *  If the email already has an account, password merges guest progress into it. */
export async function POST(request: Request) {
  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Email attach unavailable — server auth is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Valid email required." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Sign in as a guest first." }, { status: 401 });
    }

    if (user.email && user.email.toLowerCase() === email) {
      return NextResponse.json({ ok: true, email, already: true });
    }

    const admin = await createServiceClient();
    const existingId = await findAuthUserIdByEmail(admin, email);

    // Email already belongs to another account → merge with password.
    if (existingId && existingId !== user.id) {
      if (!password) {
        return NextResponse.json(
          {
            error:
              "That email already has an account. Enter your password to merge this guest progress into it.",
            code: "already_registered",
          },
          { status: 409 }
        );
      }

      const anon = await createAnonClient();
      const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError || !signedIn.user) {
        return NextResponse.json(
          {
            error: "Wrong password for that email. Try again or reset it from Log in.",
            code: "invalid_credentials",
          },
          { status: 401 }
        );
      }

      await mergeGuestIntoAccount(admin, user.id, signedIn.user.id);

      return NextResponse.json({
        ok: true,
        email,
        merged: true,
        username:
          (signedIn.user.user_metadata?.username as string | undefined) ??
          email.split("@")[0],
      });
    }

    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
      ...(password ? { password } : {}),
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("already") ||
        message.includes("registered") ||
        message.includes("exists") ||
        message.includes("error updating user")
      ) {
        return NextResponse.json(
          {
            error:
              "That email already has an account. Enter your password to merge this guest progress into it.",
            code: "already_registered",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Keep profiles.email in sync even if the auth trigger is missing.
    await admin.from("profiles").update({ email }).eq("id", user.id);

    const username =
      (data.user?.user_metadata?.username as string | undefined) ??
      data.user?.email?.split("@")[0] ??
      null;

    void sendAcademyWelcomeEmail({ email, username }).catch((err) => {
      console.error("[academy/attach-email] welcome email failed", err);
    });

    return NextResponse.json({ ok: true, email, merged: false });
  } catch (err) {
    console.error("[academy/attach-email]", err);
    return NextResponse.json(
      { error: "Could not save your email. Try again." },
      { status: 500 }
    );
  }
}
