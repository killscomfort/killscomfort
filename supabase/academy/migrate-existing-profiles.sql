-- ============================================================
-- Academy columns for EXISTING killscomfort profiles table
-- Run this if profiles already exists (site schema), BEFORE
-- applying the rest of academy/schema.sql lesson tables.
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- ============================================================

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists streak_count integer not null default 0;
alter table public.profiles add column if not exists longest_streak integer not null default 0;
alter table public.profiles add column if not exists last_active_date date;
alter table public.profiles add column if not exists has_full_access boolean not null default false;
alter table public.profiles add column if not exists stripe_customer_id text;

-- username uniqueness (ignore if already present)
do $$ begin
  alter table public.profiles add constraint profiles_username_key unique (username);
exception when duplicate_object then null;
end $$;

-- Allow null email for guest academy sessions (site schema had email not null)
alter table public.profiles alter column email drop not null;
