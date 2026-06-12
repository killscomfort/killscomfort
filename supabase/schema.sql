-- KillsComfort Database Schema
-- Run this in your Supabase SQL editor

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'premium', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking inquiries
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_contact text check (preferred_contact in ('Email', 'Phone')),
  event_type text not null,
  event_date date,
  event_location text,
  budget_range text,
  message text,
  status text not null default 'new' check (status in (
    'new', 'contacted', 'negotiation', 'deposit_made', 'collect_full_amount', 'prep_for_event', 'archived'
  )),
  source text default 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  visitor_ip text,
  created_at timestamptz not null default now()
);

-- Merch orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null,
  subtotal_cents integer not null,
  total_cents integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  paypal_order_id text,
  paypal_capture_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  price_cents integer not null,
  quantity integer not null default 1 check (quantity > 0),
  size text,
  created_at timestamptz not null default now()
);

-- Stripe merch fulfillment records (idempotency + provider tracking)
create table public.stripe_fulfillments (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_event_id text not null,
  status text not null default 'processing' check (status in ('processing', 'fulfilled', 'failed', 'skipped')),
  printful_order_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Blog posts
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  featured_image text,
  category text not null default 'Music',
  tags text[] default '{}',
  author text not null default 'Gregory Tovar',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events / gallery
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text,
  event_date date,
  category text not null default 'club',
  description text,
  cover_image text,
  gallery_images text[] default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Music entries
create table public.music_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('dj_mix', 'original', 'remix')),
  embed_url text,
  platform text not null default 'soundcloud',
  external_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Landing page content
create table public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  template text not null check (template in ('booking', 'partnership')),
  headline text not null,
  subheadline text,
  bullet_points text[] default '{}',
  testimonial_quote text,
  testimonial_author text,
  cta_text text default 'Get Started',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Site settings / social proof
create table public.site_content (
  id text primary key,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stripe_fulfillments enable row level security;
alter table public.blog_posts enable row level security;
alter table public.events enable row level security;
alter table public.music_entries enable row level security;
alter table public.landing_pages enable row level security;
alter table public.site_content enable row level security;

-- Profiles: users read/update own, admins read all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

-- Public read for published content
create policy "Public can read published posts" on public.blog_posts
  for select using (published = true);
create policy "Public can read published events" on public.events
  for select using (published = true);
create policy "Public can read published music" on public.music_entries
  for select using (published = true);
create policy "Public can read published landing pages" on public.landing_pages
  for select using (published = true);
create policy "Public can read site content" on public.site_content
  for select using (true);

-- Anyone can submit inquiries
create policy "Anyone can create inquiries" on public.inquiries
  for insert with check (true);

-- Admin policies (full access)
create policy "Admins full access inquiries" on public.inquiries
  for all using (public.is_admin());
create policy "Admins full access orders" on public.orders
  for all using (public.is_admin());
create policy "Admins full access order items" on public.order_items
  for all using (public.is_admin());
create policy "Admins full access stripe fulfillments" on public.stripe_fulfillments
  for all using (public.is_admin());
create policy "Admins full access blog" on public.blog_posts
  for all using (public.is_admin());
create policy "Admins full access events" on public.events
  for all using (public.is_admin());
create policy "Admins full access music" on public.music_entries
  for all using (public.is_admin());
create policy "Admins full access landing pages" on public.landing_pages
  for all using (public.is_admin());
create policy "Admins full access site content" on public.site_content
  for all using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed default site content
insert into public.site_content (id, content) values
  ('social_proof', '{"venues": ["Club Space", "E11EVEN", "Treehouse", "LIV"], "events_count": 150}'),
  ('testimonials', '[{"quote": "Gregory brought an energy that transformed the entire night. Professional, versatile, and rooted in the culture.", "author": "Event Director, Miami"}]'),
  ('social_links', '{"instagram": "https://instagram.com/killscomfort", "soundcloud": "https://soundcloud.com/killscomfort", "spotify": "https://open.spotify.com/artist/killscomfort", "beatport": "https://beatport.com/artist/killscomfort"}');

-- Seed sample landing pages
insert into public.landing_pages (slug, template, headline, subheadline, bullet_points, testimonial_quote, testimonial_author) values
  ('book-event', 'booking', 'Bring Real Energy to Your Next Event', 'Miami-rooted. Street-tested. Built to move crowds.', ARRAY['Clubs, festivals, and private venues', 'Versatile sets — house, techno, hip-hop, and everything between', 'Professional from inquiry to encore'], 'Gregory delivered exactly what we needed — raw energy with real professionalism.', 'Festival Coordinator'),
  ('brand-partnership', 'partnership', 'Create Something That Moves Culture', 'Partner with KillsComfort for campaigns that feel real, not manufactured.', ARRAY['Authentic storytelling rooted in Miami street culture', 'Music production and sonic branding', 'Content that connects — not just converts'], 'The collaboration felt genuine. Our audience responded because it was real.', 'Brand Director');
