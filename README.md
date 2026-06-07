# KillsComfort Website

Full-stack website for Gregory Tovar / KillsComfort — DJ, producer, and creative brand based in Miami.

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
cd killscomfort
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
