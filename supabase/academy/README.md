# KILLSCOMFORT ACADEMY — THE CHROMATIC WHEEL

> **Integrated into this repo under `src/`.** Routes live at `/academy`.
> Site already has a `profiles` table — run SQL in this order in Supabase:
> 1. `migrate-existing-profiles.sql`
> 2. `schema.sql` (tables use `IF NOT EXISTS`)
> 3. `seed.sql`
>
> Stripe Full Spectrum webhook is merged into existing `/api/stripe/webhook`
> (merch sessions keep `metadata.type=merch`; Academy uses `client_reference_id`).
> Add `STRIPE_FULL_SPECTRUM_PRICE_ID` to `.env.local` + Vercel.

Music theory fluency through the color wheel and sacred geometry, for producers,
DJs and engineers. A drop-in module for the existing Next.js site at
killscomfort.com: 26 lessons across 6 sectors, XP + levels, badges, daily
streaks, free tier (Sectors 01–02) + one-time paid Full Spectrum unlock.

## What's inside

```
app/academy/                 → landing, auth, dashboard, lesson player
app/api/stripe/              → checkout + webhook (Full Spectrum purchase)
components/Wheel.tsx         → interactive circle-of-fifths color wheel (plays audio)
components/Geometry.tsx      → sacred geometry SVG figures (vesica, flower, φ, Chladni)
components/ui.tsx            → XP bar, badges, streak, terminal chrome
content/curriculum.ts        → all 26 lessons: content + quiz tasks (edit freely)
lib/theory.ts                → key↔hue mapping, XP curve, badge defs
lib/audio.ts                 → Web Audio triad synth
lib/supabase.ts              → browser client
styles/academy.css           → self-contained stylesheet (terminal aesthetic)
supabase/schema.sql          → tables, RLS, complete_lesson() game loop
supabase/seed.sql            → lesson registry (XP + free/paid gating)
```

## Setup (≈20 minutes)

### 1. Supabase
1. Create a project at supabase.com (or use the site's existing one).
2. SQL Editor → run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Authentication → Providers → enable **Email**. For fastest onboarding,
   turn OFF "Confirm email" (or keep it on and users confirm before login).
4. Copy Project URL + anon key + service_role key into `.env.local`
   (see `.env.example`).

### 2. Stripe
1. Products → create **Full Spectrum Access**, one-time price $49.
   Copy the `price_...` id → `STRIPE_FULL_SPECTRUM_PRICE_ID`.
2. Developers → Webhooks → add endpoint
   `https://www.killscomfort.com/api/stripe/webhook`,
   event: `checkout.session.completed`. Copy the signing secret.

### 3. Site
```bash
npm i @supabase/ssr @supabase/supabase-js stripe
```
Copy the folders above into the repo (paths assume `app/` at root; if the site
uses `src/app`, drop everything one level deeper and the relative imports still
line up). Add env vars locally and in Vercel. Deploy.

Route appears at **/academy**. Add it to the site nav next to Warehouse.

## How the gamification works
- **XP/levels/streaks/badges are tamper-proof**: the client never writes them.
  Passing a lesson quiz calls the Postgres function `complete_lesson()`
  (security definer), which awards XP once per lesson, maintains the daily
  streak, checks badge conditions, and enforces the free/paid gate server-side.
- **Streak rule**: activity today holds it, yesterday extends it, older resets to 1.
- **Level curve**: level = ⌊√(xp/50)⌋ + 1 (in `lib/theory.ts`, tune freely).
- **Badges**: first lesson, each sector clear, 5-day + 12-day streaks,
  1250 XP, full completion. Definitions in `lib/theory.ts`; award logic in SQL.

## Known trade-offs (v1)
- Paid lesson **text** ships in the JS bundle (soft-gated client-side); XP,
  progress and the reward loop are hard-gated server-side. If content piracy
  becomes a concern, move `curriculum.ts` behind a server component or API.
- Auth is email/password. Magic links or OAuth are a few lines in
  `auth/page.tsx` if wanted later.

## Ideas for v2
- Leaderboard (weekly XP), audio ear-training tasks scored in-browser,
  per-lesson track submissions to the Warehouse, streak-freeze item,
  Full Spectrum coupon codes for private-lesson students.

## Troubleshooting (patched against the classics)
These are the most common failure modes on music-learning platforms, and how
this build handles each:

| Issue (industry classic) | Handling here |
|---|---|
| Streak dies at "server midnight" (timezone bug) | Streak dates computed in the **user's timezone** (client sends it; falls back to EST). |
| Streak lost after one busy day → user churns | Automatic **one-day shield**: streak survives a single missed day, resets only after two. `longest_streak` is preserved forever. |
| "I paid but it's still locked" (webhook lag) | Dashboard detects Stripe return and **polls for unlock** with a "payment received — unlocking" state instead of showing locks. |
| No password reset → support tickets | Full **forgot-password + recovery** flow on the auth page (Supabase email link). |
| Signup "does nothing" (email confirmation on) | Explicit **"confirm your email"** notice after signup; friendly error on unconfirmed login. |
| No sound on iPhone | AudioContext auto-resumes on tap; UI hints about the **ring/silent switch** (iOS mutes web audio in silent mode). |
| "Which account did I buy on?" | FAQ states purchases bind to the account email; unlock is account-wide across devices. |

An FAQ section covering all of the above ships on the landing page.

## Discount & access codes
- **Discounted purchases**: create Coupons + Promotion Codes in the Stripe
  dashboard (e.g. `KILLS20` for 20% off). Checkout already has
  `allow_promotion_codes` on — codes just work, including 100%-off ones.
- **Free comps** (students, gifts): insert rows into `access_codes` in
  Supabase (see the commented example at the bottom of `schema.sql`). Users
  redeem on their dashboard; each code has max uses and optional expiry, and
  every redemption is logged in `code_redemptions`.

## Guest mode ("Continue as guest")
- Enable it in Supabase: Authentication → Sign In / Up → **Allow anonymous
  sign-ins** (one toggle). Without it the guest button returns an error.
- Guests get real accounts (XP/streaks/badges all work) with no email;
  progress persists on their device until they add an email from the
  dashboard banner, which converts them to a full member (confirmation link).
- Purchases and access-code accounts require an email; checkout blocks guests
  server-side with `add_email_first`.
- **Email registry**: every collected email is mirrored into
  `profiles.email`, so one table holds users, emails, XP and purchase status —
  export from Supabase Table Editor anytime for your mailing list.
