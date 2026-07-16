-- ============================================================
-- KILLSCOMFORT ACADEMY // Supabase schema
-- Run in Supabase SQL Editor (Dashboard > SQL) BEFORE seed.sql
-- ============================================================

-- ---------- PROFILES (user registry) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  xp integer not null default 0,
  email text,  -- captured from auth; null for guest sessions until they add one
  streak_count integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  has_full_access boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'guest_' || left(new.id::text, 6)          -- anonymous "continue as guest" sessions
    ),
    new.email                                     -- null for guests; collected on signup/convert
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Guest → member conversion (and email changes): mirror into profiles so the
-- email registry stays queryable in one table.
create or replace function public.handle_user_email_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end $$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();

-- ---------- LESSONS (seeded from curriculum, source of truth for XP/gating) ----------
create table if not exists public.lessons (
  slug text primary key,
  sector integer not null,
  sort integer not null,
  xp integer not null default 60,
  is_free boolean not null default false
);

-- ---------- PROGRESS ----------
create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_slug text not null references public.lessons(slug) on delete cascade,
  score integer,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

-- ---------- BADGES ----------
create table if not exists public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.user_badges enable row level security;

create policy "profiles: read own"  on public.profiles for select using (auth.uid() = id);
create policy "profiles: edit own username" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "lessons: public read" on public.lessons for select using (true);
create policy "progress: read own" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "badges: read own" on public.user_badges for select using (auth.uid() = user_id);
-- NOTE: no insert/update policies on progress/badges/xp — all writes go
-- through complete_lesson() below (security definer), so XP can't be forged.

-- Prevent clients from updating protected profile columns directly
revoke update (xp, streak_count, longest_streak, last_active_date, has_full_access, stripe_customer_id)
  on public.profiles from anon, authenticated;

-- ---------- THE GAME LOOP: complete_lesson ----------
-- Awards XP once per lesson, maintains daily streaks, grants badges.
-- Returns json: { ok, already, xp, streak, new_badges[] }
create or replace function public.complete_lesson(p_slug text, p_score integer default null, p_tz text default 'America/New_York')
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_today date;
  v_lesson public.lessons%rowtype;
  v_profile public.profiles%rowtype;
  v_new_badges text[] := '{}';
  v_done_in_sector int;
  v_total_in_sector int;
  v_done_total int;
  v_total int;
begin
  -- Streak dates computed in the USER'S timezone (falls back to EST).
  -- Prevents the classic 'my streak died at UTC midnight' bug.
  begin
    v_today := (now() at time zone p_tz)::date;
  exception when others then
    v_today := (now() at time zone 'America/New_York')::date;
  end;

  if v_uid is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_lesson from public.lessons where slug = p_slug;
  if not found then
    return json_build_object('ok', false, 'error', 'unknown_lesson');
  end if;

  select * into v_profile from public.profiles where id = v_uid;

  -- Gate: paid lessons require full access
  if not v_lesson.is_free and not v_profile.has_full_access then
    return json_build_object('ok', false, 'error', 'locked');
  end if;

  -- Idempotent: no double XP
  if exists (select 1 from public.lesson_progress where user_id = v_uid and lesson_slug = p_slug) then
    return json_build_object('ok', true, 'already', true,
      'xp', v_profile.xp, 'streak', v_profile.streak_count, 'longest_streak', v_profile.longest_streak, 'new_badges', '[]'::json);
  end if;

  insert into public.lesson_progress (user_id, lesson_slug, score) values (v_uid, p_slug, p_score);

  -- Streak: hold if today, +1 if yesterday, SHIELD one missed day (+1),
  -- reset to 1 only after 2+ missed days. Longest streak is never erased.
  if v_profile.last_active_date = v_today then
    null;
  elsif v_profile.last_active_date >= v_today - 2 then
    v_profile.streak_count := v_profile.streak_count + 1;
  else
    v_profile.streak_count := 1;
  end if;
  v_profile.longest_streak := greatest(coalesce(v_profile.longest_streak,0), v_profile.streak_count);

  v_profile.xp := v_profile.xp + v_lesson.xp;

  update public.profiles
     set xp = v_profile.xp,
         streak_count = v_profile.streak_count,
         longest_streak = v_profile.longest_streak,
         last_active_date = v_today
   where id = v_uid;

  -- ------- Badge checks -------
  select count(*) into v_done_total from public.lesson_progress where user_id = v_uid;
  select count(*) into v_total from public.lessons;
  select count(*) into v_total_in_sector from public.lessons where sector = v_lesson.sector;
  select count(*) into v_done_in_sector
    from public.lesson_progress lp join public.lessons l on l.slug = lp.lesson_slug
   where lp.user_id = v_uid and l.sector = v_lesson.sector;

  if v_done_total = 1 then v_new_badges := array_append(v_new_badges, 'first-light'); end if;
  if v_done_in_sector = v_total_in_sector then
    v_new_badges := array_append(v_new_badges, 'sector-' || v_lesson.sector);
  end if;
  if v_done_total = v_total then v_new_badges := array_append(v_new_badges, 'chromatic'); end if;
  if v_profile.streak_count >= 5 then v_new_badges := array_append(v_new_badges, 'perfect-fifth'); end if;
  if v_profile.streak_count >= 12 then v_new_badges := array_append(v_new_badges, 'full-wheel'); end if;
  if v_profile.xp >= 1250 then v_new_badges := array_append(v_new_badges, 'harmonic'); end if;

  insert into public.user_badges (user_id, badge_id)
  select v_uid, b from unnest(v_new_badges) as b
  on conflict do nothing;

  -- Only report badges that were actually newly inserted this call
  return json_build_object(
    'ok', true, 'already', false,
    'xp', v_profile.xp,
    'streak', v_profile.streak_count,
    'longest_streak', v_profile.longest_streak,
    'new_badges', coalesce((
      select json_agg(badge_id) from public.user_badges
      where user_id = v_uid and earned_at > now() - interval '2 seconds'
    ), '[]'::json)
  );
end $$;

grant execute on function public.complete_lesson(text, integer, text) to authenticated;

-- ============================================================
-- ACCESS CODES — free comps / gifted Full Spectrum.
-- Codes are invisible to clients (no select policy); the only
-- path is the redeem function below. Discounted (non-free)
-- pricing is handled by Stripe promotion codes at checkout.
-- ============================================================
create table if not exists public.access_codes (
  code text primary key,                    -- stored UPPERCASE
  max_uses integer not null default 1,
  uses integer not null default 0,
  expires_at timestamptz,
  note text                                  -- e.g. 'private lesson students July'
);
alter table public.access_codes enable row level security; -- no policies: clients can't read codes

create table if not exists public.code_redemptions (
  user_id uuid references public.profiles(id) on delete cascade,
  code text not null,
  redeemed_at timestamptz not null default now(),
  primary key (user_id, code)
);
alter table public.code_redemptions enable row level security;
create policy "own redemptions" on public.code_redemptions for select using (auth.uid() = user_id);

create or replace function public.redeem_access_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_code access_codes%rowtype;
  v_clean text := upper(trim(p_code));
begin
  if v_uid is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_code from access_codes where code = v_clean for update;

  if not found then
    return json_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if v_code.expires_at is not null and v_code.expires_at < now() then
    return json_build_object('ok', false, 'error', 'code_expired');
  end if;
  if v_code.uses >= v_code.max_uses then
    return json_build_object('ok', false, 'error', 'code_fully_redeemed');
  end if;
  if exists (select 1 from code_redemptions where user_id = v_uid and code = v_clean) then
    return json_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  update access_codes set uses = uses + 1 where code = v_clean;
  insert into code_redemptions (user_id, code) values (v_uid, v_clean);
  update profiles set has_full_access = true where id = v_uid;

  return json_build_object('ok', true);
end $$;

grant execute on function public.redeem_access_code(text) to authenticated;

-- Example: comp 10 students until year end (run in SQL editor, edit freely)
-- insert into public.access_codes (code, max_uses, expires_at, note)
-- values ('WAREHOUSE2026', 10, '2026-12-31', 'private lesson students');
