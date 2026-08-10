# CURSOR: INTEGRATE "THE CHROMATIC WHEEL" INTO killscomfort.com

You are integrating a complete, build-verified course module into an existing
Next.js site. Do not rewrite the module's logic or styling — it is final and
matches the site's aesthetic. Your job is placement, wiring, and verification.

## 1. Detect the repo layout
- If routes live in `app/` at the repo root → copy this package's folders as-is.
- If routes live in `src/app/` → place `app/academy` and `app/api/stripe`
  inside `src/app/`, and `components`, `content`, `lib`, `styles` inside `src/`.
  The module uses relative imports throughout, so no path-alias changes are
  needed as long as the five folders keep their positions relative to `app/`.

## 2. Copy these folders (merge, never overwrite existing site files)
- `app/academy/`        → the course routes (landing, auth, dashboard, lesson/[slug])
- `app/api/stripe/`     → checkout + webhook routes
- `components/`         → Wheel.tsx, Geometry.tsx, ui.tsx (namespaced kc- classes)
- `content/`            → curriculum.ts (all 27 lessons)
- `lib/`                → theory.ts, audio.ts, supabase.ts
- `styles/academy.css`  → self-contained; imported only by app/academy/layout.tsx;
                          will not leak into or collide with existing site CSS
- `supabase/`           → schema.sql + seed.sql (NOT served; for the DB step)

If the site already has files named `components/ui.tsx` or `lib/supabase.ts`,
rename this module's copies (e.g. `lib/academy-supabase.ts`) and update the
imports inside `app/academy/**` and `app/api/stripe/**` only.

## 3. Install dependencies
```bash
npm i @supabase/ssr @supabase/supabase-js stripe
```

## 4. Environment variables (.env.local + Vercel)
See `.env.example`. Required: NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server-only),
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_FULL_SPECTRUM_PRICE_ID,
NEXT_PUBLIC_SITE_URL.

## 5. Database (one-time, human does this in Supabase dashboard)
1. SQL Editor → run `supabase/schema.sql`, then `supabase/seed.sql`.
2. Authentication → enable Email provider.
3. Authentication → Sign In/Up → enable **Allow anonymous sign-ins**
   (required by the "Continue as guest" button).

## 6. Stripe (one-time, human does this in Stripe dashboard)
1. Product "Full Spectrum Access", one-time price $49 → price id to env.
2. Webhook endpoint `<site>/api/stripe/webhook`,
   event `checkout.session.completed` → signing secret to env.
3. Discount codes are Stripe Promotion Codes (checkout already has
   `allow_promotion_codes: true`). Free-comp access codes are rows in the
   `access_codes` table (example at the bottom of schema.sql).

## 7. Site nav
Add an "Academy" link pointing to `/academy` in the site's existing nav
(alongside Music / Merch / Warehouse / Services / Events). Do not restyle the
academy's internal nav.

## 8. Verify (all must pass)
- `npm run build` compiles with zero errors.
- `/academy` renders: ASCII header, playable color wheel (click = sound),
  curriculum list, FAQ, $49 panel.
- `/academy/auth`: signup, login, forgot-password, and "Continue as guest" all render.
- Guest flow: guest → dashboard shows GUEST SESSION banner; adding an email
  sends a confirmation.
- Signed-in flow: completing lesson `why-color` (pass the 3-question check)
  awards +50 XP, starts a streak, grants the FIRST LIGHT badge.
- Paid gate: opening `/academy/lesson/triads` without Full Spectrum shows the
  "edge of the free spectrum" screen with a working checkout button.
- Access code: after inserting a test code in `access_codes`, redeeming it on
  the dashboard flips access instantly.

## Architecture notes (do not "fix" these)
- All XP/streak/badge writes go through the Postgres function
  `complete_lesson()` — the client never writes gamification columns. This is
  intentional anti-tamper design; RLS revokes direct updates.
- Streak dates use the CLIENT's timezone (passed as `p_tz`) with a one-day
  "shield" — intentional, matches product spec.
- Paid lesson text is soft-gated client-side; access/XP are hard-gated
  server-side. Known v1 trade-off documented in README.md.
