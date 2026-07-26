import { NextResponse } from "next/server";
import { z } from "zod";
import { grantFoundingAcademyAccessIfEligible } from "@/lib/academy-founding";
import { sendAcademyWelcomeEmail } from "@/lib/email";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(24, "Username must be 24 characters or less")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only use letters, numbers, . _ -"),
});

export async function POST(request: Request) {
  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Registry unavailable — server auth is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid registration details." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const { password, username } = parsed.data;

  try {
    const admin = await createServiceClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("already") ||
        message.includes("registered") ||
        message.includes("exists")
      ) {
        return NextResponse.json(
          {
            error: "That email is already registered — log in instead.",
            code: "already_registered",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Could not create your registry entry. Try again." },
        { status: 500 }
      );
    }

    const { founding, cohortSize } = await grantFoundingAcademyAccessIfEligible(
      admin,
      { userId, email, username }
    );

    void sendAcademyWelcomeEmail({ email, username, founding, cohortSize }).catch(
      (err) => {
        console.error("[academy/register] welcome email failed", err);
      }
    );

    return NextResponse.json({
      ok: true,
      userId,
      email,
      founding,
      cohortSize,
    });
  } catch (err) {
    console.error("[academy/register]", err);
    return NextResponse.json(
      { error: "Could not create your registry entry. Try again." },
      { status: 500 }
    );
  }
}
