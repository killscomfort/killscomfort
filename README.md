# KillsComfort Website

Full-stack website for Gregory Tovar / KillsComfort — DJ, producer, sound engineer, and creative brand based in Miami.

Official site for the KillsComfort brand — music, merch, events, and booking.

## Tech Stack

- **Next.js 15** (App Router, SSR/SSG)
- **Tailwind CSS 4** — earth-tone design system
- **Supabase** — auth, PostgreSQL database, RLS
- **Resend** — transactional email (inquiries, confirmations)
- **Framer Motion** — scroll animations (ready to extend)
- **Vercel** — recommended hosting

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your project URL and keys to `.env.local` (see `.env.example`)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in Supabase keys, Resend API key, and analytics IDs.

For merch dropship automation, also set:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PRINTFUL_API_KEY`

Then configure Printful variant IDs in `src/lib/merch-printful.ts`.

Printful ID fail-fast TODO map is intentionally prefilled with `0` placeholders for all current merch variants:

- `kills-shorts`: `32`, `34`, `36`, `38`
- `diamond-hoodie`: `S`, `M`, `L`, `XL`
- `die-cut-stickers`: `DEFAULT`

The Stripe webhook throws and marks fulfillment `failed` if any `variantId` is missing/`<= 0`, so no order is silently sent with bad mappings.

### 4. Set admin role

After registering your account, promote yourself to admin in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe -> Printful webhook testing (local)

1. Start your app:

```bash
npm run dev
```

2. Forward Stripe events to local webhook:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the returned webhook signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

3. Trigger a merch checkout in the app using a Stripe test card (for example `4242 4242 4242 4242`).

4. Verify flow:

- Stripe CLI shows `checkout.session.completed`
- Server logs include `[stripe-webhook] fulfilled merch order`
- Supabase `stripe_fulfillments` table has a `fulfilled` record
- Printful dashboard/API shows a created order for external id `stripe-session-<session_id>`

### Stripe webhook setup (dashboard)

If webhook endpoint creation is not done via API tooling, create it in Stripe Dashboard:

1. Go to Developers -> Webhooks -> Add endpoint.
2. Endpoint URL: `https://<your-domain>/api/stripe/webhook`
3. Events to send: `checkout.session.completed`
4. Save endpoint, then copy its signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero, services, social proof, music, gallery |
| `/about` | Gregory's story and philosophy |
| `/music` | DJ mixes, productions, streaming links |
| `/events` | Past events gallery with filters |
| `/book` | Primary booking/inquiry form |
| `/journal` | Blog / SEO content |
| `/lp/book-event` | Ad landing page — event booking |
| `/lp/brand-partnership` | Ad landing page — brand partnerships |
| `/login`, `/register` | User authentication |
| `/dashboard` | User account dashboard |
| `/admin` | Content & inquiry management (admin only) |

## Brand Assets

Replace placeholder images and colors with client-provided assets:

- Logo files → `public/`
- Press photos → update image URLs in components or via Supabase storage
- Music embeds → add via admin or `music_entries` table
- Social links → update `src/lib/constants.ts`

## Deployment

Deploy to Vercel:

1. Connect your Git repo
2. Add environment variables from `.env.example`
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain

## Deliverables Status

- [x] Full responsive website (all pages)
- [x] User authentication (register, login, profile)
- [x] Admin dashboard (inquiries, users, content sections)
- [x] Booking inquiry form with email notifications
- [x] 2 ad-specific landing page templates
- [x] Blog/journal system (static + DB-ready)
- [x] Music and events/gallery sections
- [x] SEO (meta tags, sitemap, structured data)
- [x] Analytics hooks (GA4, GTM, Meta Pixel)
- [x] Mobile-first design
- [ ] Performance audit (run Lighthouse after deploy)
- [ ] Client brand assets integration
