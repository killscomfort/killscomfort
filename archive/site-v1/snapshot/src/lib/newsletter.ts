import { SITE } from "@/lib/constants";
import {
  createAnonClient,
  createServiceClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { NewsletterSubscriber } from "@/types/database";

export function getNewsletterUnsubscribeUrl(token: string) {
  return `${SITE.url}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

async function getNewsletterClient() {
  try {
    return await createServiceClient();
  } catch {
    return createAnonClient();
  }
}

export async function subscribeNewsletter(input: {
  email: string;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}): Promise<
  | { ok: true; subscriber: NewsletterSubscriber; reactivated: boolean }
  | { ok: false; code: "not_configured" | "duplicate" | "db_error"; message?: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "not_configured" };
  }

  const supabase = await getNewsletterClient();
  const normalizedEmail = input.email.toLowerCase();

  const { data: inserted, error: insertError } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email: normalizedEmail,
      source: input.source || "website",
      utm_source: input.utm_source || null,
      utm_medium: input.utm_medium || null,
      utm_campaign: input.utm_campaign || null,
    })
    .select("*")
    .single();

  if (!insertError && inserted) {
    return {
      ok: true,
      subscriber: inserted as NewsletterSubscriber,
      reactivated: false,
    };
  }

  if (insertError?.code !== "23505") {
    console.error("Newsletter subscribe error:", insertError);
    return {
      ok: false,
      code: "db_error",
      message: insertError?.message,
    };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, code: "duplicate" };
  }

  const subscriber = existing as NewsletterSubscriber;

  if (!subscriber.unsubscribed_at) {
    return { ok: false, code: "duplicate" };
  }

  const { data: reactivated, error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      unsubscribed_at: null,
      source: input.source || subscriber.source || "website",
      utm_source: input.utm_source || null,
      utm_medium: input.utm_medium || null,
      utm_campaign: input.utm_campaign || null,
    })
    .eq("id", subscriber.id)
    .select("*")
    .single();

  if (updateError || !reactivated) {
    console.error("Newsletter resubscribe error:", updateError);
    return {
      ok: false,
      code: "db_error",
      message: updateError?.message,
    };
  }

  return {
    ok: true,
    subscriber: reactivated as NewsletterSubscriber,
    reactivated: true,
  };
}

export async function unsubscribeNewsletterByToken(
  token: string
): Promise<
  | { ok: true; email: string; alreadyUnsubscribed: boolean }
  | { ok: false; code: "not_configured" | "invalid_token" | "db_error" }
> {
  if (!isSupabaseConfigured() || !token.trim()) {
    return { ok: false, code: "invalid_token" };
  }

  const supabase = await getNewsletterClient();
  const { data: subscriber, error: fetchError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, unsubscribed_at")
    .eq("unsubscribe_token", token.trim())
    .maybeSingle();

  if (fetchError || !subscriber) {
    return { ok: false, code: "invalid_token" };
  }

  if (subscriber.unsubscribed_at) {
    return {
      ok: true,
      email: subscriber.email,
      alreadyUnsubscribed: true,
    };
  }

  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Newsletter unsubscribe error:", updateError);
    return { ok: false, code: "db_error" };
  }

  return {
    ok: true,
    email: subscriber.email,
    alreadyUnsubscribed: false,
  };
}

export async function getNewsletterSubscriberByToken(token: string) {
  if (!isSupabaseConfigured() || !token.trim()) return null;

  const supabase = await getNewsletterClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribed_at")
    .eq("unsubscribe_token", token.trim())
    .maybeSingle();

  return data;
}
