#!/usr/bin/env node
/**
 * Verify Supabase + Resend configuration after filling in .env.local
 * Usage: node --env-file=.env.local scripts/verify-setup.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
];

const placeholders = ["your-", "placeholder", "xxxxxxxx", "re_xxxxxxxx"];

function isSet(name) {
  const value = process.env[name]?.trim();
  if (!value) return false;
  return !placeholders.some((p) => value.toLowerCase().includes(p));
}

function report(name, ok, detail = "") {
  const mark = ok ? "✓" : "✗";
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function verifySupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isSet("NEXT_PUBLIC_SUPABASE_URL") || !isSet("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    report("Supabase public keys", false, "fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return false;
  }

  const anon = createClient(url, anonKey);
  const { error: healthError } = await anon.from("site_content").select("id").limit(1);
  if (healthError) {
    report("Supabase schema", false, healthError.message);
    return false;
  }
  report("Supabase schema", true, "site_content reachable with anon key");

  if (!isSet("SUPABASE_SERVICE_ROLE_KEY")) {
    report("Supabase service role", false, "fill SUPABASE_SERVICE_ROLE_KEY");
    return false;
  }

  const service = createClient(url, serviceKey);
  const { error: serviceError } = await service.from("page_views").select("id").limit(1);
  if (serviceError) {
    report("Supabase service role", false, serviceError.message);
    return false;
  }
  report("Supabase service role", true, "page_views reachable");

  return true;
}

async function verifyResend() {
  if (!isSet("RESEND_API_KEY")) {
    report("Resend API key", false, "fill RESEND_API_KEY from https://resend.com/api-keys");
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.domains.list();

  if (error) {
    report("Resend API key", false, error.message);
    return false;
  }

  const from = process.env.EMAIL_FROM || "";
  const usingDevSender = from.includes("onboarding@resend.dev");
  const domains = data?.data?.map((d) => `${d.name} (${d.status})`) ?? [];

  report("Resend API key", true, domains.length ? `domains: ${domains.join(", ")}` : "no domains yet");
  if (usingDevSender) {
    report("Resend sender", true, "using onboarding@resend.dev (dev only — verify killscomfort.com for production)");
  } else if (!from.includes("killscomfort.com")) {
    report("Resend sender", false, "EMAIL_FROM should use a verified domain or onboarding@resend.dev for local tests");
  } else {
    const verified = data?.data?.some((d) => d.name === "killscomfort.com" && d.status === "verified");
    report("Resend sender", verified, verified ? "killscomfort.com verified" : "verify killscomfort.com in Resend dashboard");
  }

  return true;
}

async function main() {
  console.log("KillsComfort — Supabase & Resend setup check\n");

  let allRequired = true;
  for (const name of required) {
    const ok = isSet(name);
    report(name, ok);
    if (!ok) allRequired = false;
  }

  if (!allRequired) {
    console.log("\nAdd missing values to .env.local, then run this script again.");
    process.exit(1);
  }

  console.log("");
  const supabaseOk = await verifySupabase();
  const resendOk = await verifyResend();

  console.log("");
  if (supabaseOk && resendOk) {
    console.log("All checks passed. Next steps:");
    console.log("  1. npm run dev");
    console.log("  2. Register at http://localhost:3000/register");
    console.log("  3. Promote your account to admin in Supabase SQL editor:");
    console.log("     UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';");
    console.log("  4. Test email: node --env-file=.env.local scripts/test-order-email.mjs your@email.com");
    process.exit(0);
  }

  console.log("Some checks failed — see messages above.");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
