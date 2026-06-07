# KillsComfort — Full Website Build Specification

## Overview

**Brand Name:** KillsComfort
**Founder:** Gregory Tovar — DJ, Producer, Creative Visionary
**Location:** Miami, Florida
**Domain:** Existing (client to provide)
**Tagline Direction:** Growth lives on the other side of comfort. Kill the comfort. Find yourself.

KillsComfort is a personal brand and platform for Gregory Tovar — a Miami-based DJ/producer building a movement rooted in self-discovery, creative expression, and service to others. The primary business goal is to generate bookings for DJ/producer gigs through paid traffic campaigns while establishing trust and credibility with people who have never heard of Gregory before.

---

## Brand Identity & Visual Direction

### Aesthetic
- **Street-oriented, raw, gritty** — built from the trenches, not from a studio
- **Earth tones + dark/moody palette** — think concrete, soil, rust, smoke, charcoal, deep greens, burnt orange, muted golds against black and near-black backgrounds
- **Miami melting pot energy** — multicultural, layered, textured, alive
- **NOT polished-corporate, NOT generic DJ template, NOT neon-club-flyer aesthetic**
- Refined through experience — the grit is intentional, not sloppy
- Typography should feel editorial and bold, like a street magazine or zine. Mix heavy display type with raw hand-done or stencil-inspired accents
- Textures: grain, noise, concrete, asphalt, halftone dots, torn paper edges, film grain overlays
- Photography style: high contrast, desaturated, candid/documentary feel over posed studio shots

### Color Palette (Suggested — client has brand assets to confirm)
- **Primary darks:** #0D0D0D (near black), #1A1A17 (warm charcoal)
- **Earth tones:** #8B6F47 (clay), #A67C52 (desert sand), #4A5D3A (moss green), #BF6A30 (burnt sienna)
- **Accents:** #D4A853 (muted gold), #C4442A (dried blood red)
- **Neutrals:** #E8DCC8 (bone/cream for text on dark), #6B6B6B (mid gray)

> **NOTE TO AGENT:** Client has a logo, color palette, photos, and press kit ready. Request these assets before finalizing the design system. The colors above are directional — defer to the client's actual brand kit.

### Brand Assets (Client Will Provide)
- Logo (primary + variations)
- Brand color codes
- Press photos / artist shots
- Any existing flyers, social media templates, or visual references
- Music links and embeds

---

## Tech Stack

**Decision left to the AI agent**, but the spec requires:
- Server-side rendering or static generation for SEO (Next.js, Nuxt, Astro, etc.)
- Full user authentication system (accounts, login, registration)
- Database for user data, inquiries, and future e-commerce
- CMS or admin panel for Gregory to manage content (blog posts, events, gallery)
- API architecture that supports future expansion (e-commerce, community features)
- Responsive design — mobile-first (most paid traffic will come from mobile)
- Fast load times (critical for paid traffic conversion rates)
- Analytics integration (Google Analytics, Meta Pixel, etc.)

### Recommended Consideration
- **Frontend:** Next.js (React) or Astro with React islands
- **Backend/DB:** Supabase, PlanetScale, or PostgreSQL with Prisma
- **Auth:** NextAuth.js, Supabase Auth, or Clerk
- **CMS:** Sanity, Strapi, or built-in admin dashboard
- **Hosting:** Vercel, Railway, or similar
- **Email:** Resend, SendGrid, or Mailgun for transactional emails

---

## Site Architecture & Pages

### 1. Homepage (Also serves as primary landing experience)
**Purpose:** First impression — build trust, establish credibility, convert visitors into inquiries.

**Sections (in scroll order):**
- **Hero:** Full-viewport, cinematic. Video background or high-contrast photo of Gregory performing. Brand name "KillsComfort" large and dominant. One-line value proposition. Primary CTA button: "Book Me" or "Let's Work Together." Secondary CTA: "See My Work"
- **Who Is KillsComfort:** Brief intro — 2-3 sentences max. Photo of Gregory. Humanize the brand. This section answers "why should I trust this person?" for cold traffic
- **What I Do:** Three clear offerings — DJ sets, production, event curation. Each with a short description and icon/visual
- **Social Proof / Press:** Logos of venues played, artists collaborated with, any press mentions. Testimonial quotes from event organizers or partners if available
- **Music Section:** Embedded player (SoundCloud/Spotify) — 3-4 featured tracks or mixes. Let the work speak
- **Gallery / Past Events:** Grid of photos from past events. Moody, atmospheric shots. Clicking opens a lightbox
- **CTA Strip:** "Ready to bring the energy? Let's talk." with inquiry form button
- **Footer:** Social links (Instagram, SoundCloud, Spotify, Beatport), email, copyright, navigation links

### 2. About Page
**Purpose:** Deep dive into Gregory's story for people who want to know more before booking.

**Content:**
- Origin story — Miami upbringing, melting pot of cultures, the streets, how music became the outlet
- The meaning behind "KillsComfort" — the philosophy, not just the name
- Journey as a DJ/producer — milestones, evolution, genres
- The service mindset — why creating for others is the core
- The vision — where KillsComfort is headed (community, creative safe space, future offerings)
- Professional photo(s)
- Timeline or milestone markers (optional, but reinforces credibility)

### 3. Music Page
**Purpose:** Portfolio of work. Let people hear the range and quality.

**Content:**
- Featured mixes (SoundCloud embeds)
- Tracks / releases (Spotify, Beatport embeds or links)
- Organized by category: DJ Mixes, Original Productions, Remixes (if applicable)
- Links to all streaming platforms
- Option for CMS-managed entries so Gregory can add new releases

### 4. Events / Gallery Page
**Purpose:** Visual proof of experience. Show, don't tell.

**Content:**
- Photo grid from past events
- Each event can have: event name, venue, date, photo gallery
- Filterable or categorized (clubs, private events, festivals, etc.)
- CMS-managed so new events can be added easily

### 5. Booking / Inquiry Page
**Purpose:** Primary conversion page. This is where paid traffic CTAs lead.

**Content:**
- Headline: Direct, confident — "Let's Create Something Unforgettable"
- Short paragraph reinforcing value and professionalism
- **Inquiry Form Fields:**
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Event type (dropdown: Club Night, Festival, Private Event, Corporate, Wedding, Brand Partnership, Other)
  - Event date (date picker)
  - Event location / venue
  - Estimated budget range (dropdown: Under $500, $500-$1500, $1500-$3000, $3000-$5000, $5000+, Prefer to discuss)
  - Message / details (textarea)
- Form submissions should:
  - Save to database
  - Send email notification to Gregory
  - Send auto-confirmation email to the inquirer
  - Show a thank-you message with expected response time
- Trust elements near the form: testimonial, past venue logos, "Trusted by X events" counter

### 6. Blog / Journal Page (Optional but recommended)
**Purpose:** SEO, content marketing, and showcasing Gregory's perspective.

**Content:**
- CMS-managed blog posts
- Categories: Music, Culture, Growth, Miami, Behind the Scenes
- Each post: title, featured image, date, author, body content, tags
- Supports the self-discovery/creative expression angle for future expansion
- Good for organic traffic and retargeting audiences

### 7. Ad-Specific Landing Pages
**Purpose:** Dedicated pages for paid traffic campaigns with zero distractions.

**Variations to build:**

**Landing Page A — Event Booking Focus:**
- Headline targeting event organizers
- 3 bullet points of value (experience, versatility, professionalism)
- Social proof (logos, testimonial)
- Embedded music sample
- Inquiry form (simplified: name, email, event type, date, message)
- No main navigation — single focus on conversion

**Landing Page B — Brand/Partnership Focus:**
- Headline targeting brands and collaborators
- Portfolio highlights
- Past partnerships or collaborations
- CTA to schedule a conversation
- No main navigation

> These pages should be templatized so new landing pages can be spun up easily for different campaigns.

### 8. User Account System
**Purpose:** Foundation for future community features, course access, and exclusive content.

**MVP Features:**
- Registration (email + password, or social login)
- Login / logout
- User profile (name, avatar, bio)
- Dashboard (placeholder for now — "More coming soon")
- Account settings (update email, password, profile)

**Future-Ready Architecture:**
- Role-based access (regular user, premium member, admin)
- Ability to gate content behind membership
- Notification preferences
- Activity feed placeholder
- Prepared for future e-commerce (order history, saved payment methods)

### 9. Admin Dashboard
**Purpose:** Gregory manages his site without touching code.

**Features:**
- View and manage booking inquiries (new, read, responded, archived)
- Create/edit/delete blog posts
- Manage events and gallery photos
- Upload music links and embeds
- View registered users
- Basic analytics overview (inquiry count, traffic, etc.)
- Manage landing page content

---

## Key Features & Integrations

### Email System
- Transactional emails: inquiry confirmation, account verification, password reset
- Email notification to Gregory on new inquiry
- Future: newsletter integration for marketing emails

### Social Media Integration
- **Instagram:** Feed embed or link on homepage/footer
- **SoundCloud:** Embedded players throughout the site
- **Spotify:** Embedded players and profile link
- **Beatport:** Link to artist profile
- All social links in footer and mobile menu

### SEO
- Meta titles and descriptions on all pages
- Open Graph and Twitter Card tags for social sharing
- Structured data (JSON-LD) for local business and music artist
- Sitemap.xml and robots.txt
- Fast Core Web Vitals (critical for SEO and ad quality scores)

### Analytics & Tracking
- Google Analytics 4
- Meta Pixel (Facebook/Instagram ads)
- Google Tag Manager for easy pixel management
- Event tracking on: form submissions, CTA clicks, music plays, page scrolls
- UTM parameter support for campaign tracking on landing pages

### Performance
- Image optimization (WebP/AVIF, lazy loading)
- Code splitting and minimal JS bundles
- CDN for static assets
- Target: Lighthouse score 90+ on mobile

---

## Conversion Strategy (For Paid Traffic)

### Funnel Flow
1. **Ad (Instagram/Facebook/TikTok)** → Landing page (A or B depending on campaign)
2. **Landing page** → Inquiry form submission
3. **Auto-confirmation email** → Sets expectations, reinforces brand
4. **Gregory follows up** → Books the gig

### Trust-Building Elements (Critical for cold traffic)
- Professional press-quality photos (not selfies)
- Venue logos and collaboration credits
- Testimonials from real event organizers
- Embedded music so they can hear the quality
- Consistent brand identity across ad → landing page → site
- "As seen at" or "Trusted by" social proof bars
- Professional inquiry form (not just a "DM me" link)

---

## Design Specifications

### Typography
- **Display / Headlines:** Bold, impactful typeface — stencil, condensed, or industrial-inspired (e.g., Bebas Neue, Druk, Anton, or something from the brand kit)
- **Body:** Clean, readable sans-serif with personality (e.g., DM Sans, Outfit, or something from the brand kit)
- **Accent:** Handwritten or raw texture font for quotes, callouts, or section labels (optional)

### Layout Principles
- Mobile-first responsive design
- Generous use of full-bleed images and video
- Asymmetric grid layouts to avoid template feel
- Scroll-triggered animations (subtle, not overdone)
- Dark backgrounds as default, with earth-tone sections for contrast
- Grain/noise texture overlay on backgrounds for that raw, analog feel

### UI Components
- Buttons: Solid with slight texture, uppercase text, subtle hover animation
- Cards: Dark with soft borders, hover lift effect
- Forms: Dark inputs with earth-tone focus states, clear validation
- Navigation: Minimal top nav, hamburger on mobile, sticky on scroll
- Music players: Custom-styled wrappers around embeds to match brand

---

## Future Expansion (Not in MVP, but architecture should support)

- **E-commerce:** Merch store, beat sales, event tickets
- **Community Forum:** Safe space for creatives to connect and share
- **Self-Discovery Platform:** Core values workshops, human design content, coaching
- **Online Courses:** Video-based learning platform
- **Event Calendar:** Public-facing calendar of upcoming gigs
- **Membership Tiers:** Free, premium, VIP access levels
- **Podcast / Video Content:** Embedded media section

---

## Deliverables Checklist

- [ ] Full responsive website (all pages listed above)
- [ ] User authentication system (register, login, profile)
- [ ] Admin dashboard for content management
- [ ] Booking inquiry form with email notifications
- [ ] 2 ad-specific landing page templates
- [ ] Blog/journal system
- [ ] Music and events/gallery sections
- [ ] SEO setup (meta tags, sitemap, structured data)
- [ ] Analytics integration (GA4, Meta Pixel, GTM)
- [ ] Mobile-optimized (mobile-first design)
- [ ] Performance optimized (90+ Lighthouse mobile)
- [ ] Deployment-ready configuration

---

## Brand Voice & Copy Guidelines

**Tone:** Confident but not arrogant. Raw but not reckless. Warm but not soft. Service-oriented but not submissive. Street-smart but articulate.

**Key Themes to Weave Into Copy:**
- Killing comfort zones to find growth
- Gratitude as a superpower, especially for creatives
- Miami as a crucible — shaped by every culture that touched it
- Music as service — creating experiences for others, not ego
- Safe spaces for creative expression
- Innovation born from the streets, not the ivory tower

**Words/Phrases to Use:** Raw, real, rooted, built from the ground, no shortcuts, service, gratitude, culture, energy, experience, movement, safe space, express, connect, create

**Words/Phrases to Avoid:** Luxury, exclusive (in a gatekeeping way), hustle culture clichés, generic DJ buzzwords ("drop the beat," "turn up"), anything that sounds like a template

---

*This spec was created for Gregory Tovar / KillsComfort. Provide this document to your AI agent along with your brand assets (logo, colors, photos, music links, social media handles) to begin the build.*
