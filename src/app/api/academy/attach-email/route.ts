import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAcademyWelcomeEmail } from "@/lib/email";
import {
  createClient,
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email(),
});

/** Attach an email to a guest session without a confirmation link. */
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

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Sign in as a guest first." }, { status: 401 });
    }

    const admin = await createServiceClient();
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const username =
      (data.user?.user_metadata?.username as string | undefined) ??
      data.user?.email?.split("@")[0] ??
      null;

    void sendAcademyWelcomeEmail({ email, username }).catch((err) => {
      console.error("[academy/attach-email] welcome email failed", err);
    });

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("[academy/attach-email]", err);
    return NextResponse.json(
      { error: "Could not save your email. Try again." },
      { status: 500 }
    );
  }
}
