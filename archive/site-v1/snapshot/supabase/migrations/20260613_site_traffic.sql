-- First-party site traffic tracking
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_ip text,
  path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  city text,
  neighborhood text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_ip_idx on public.page_views (visitor_ip);
create index if not exists page_views_country_idx on public.page_views (country);

create table if not exists public.excluded_ips (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null unique,
  label text not null,
  city text,
  region text,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;
alter table public.excluded_ips enable row level security;

create policy "Admins full access page views" on public.page_views
  for all using (public.is_admin());

create policy "Admins full access excluded ips" on public.excluded_ips
  for all using (public.is_admin());
