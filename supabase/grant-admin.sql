-- ============================================================================
-- GRANT ADMIN ACCESS
-- ============================================================================
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- WHY YOU NEED THIS
-- public.handle_new_user() creates every profile with role = 'user' (the column
-- default). Nothing in the schema, seed data, or app code ever promotes an
-- account to 'admin'. So /admin redirects to /dashboard for everyone, including
-- you — see src/lib/supabase/middleware.ts, which checks profiles.role.
--
-- This is a one-time bootstrap. After it runs, /admin works for that account.
-- ============================================================================

-- STEP 1 — Find your account. Run this first and confirm the email is the one
-- you actually log in with.
select
  u.id,
  u.email,
  u.created_at as signed_up,
  u.last_sign_in_at,
  p.role,
  case
    when p.id is null then 'NO PROFILE ROW — see Step 3'
    when p.role = 'admin' then 'already admin'
    else 'not an admin — run Step 2'
  end as diagnosis
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at;


-- STEP 2 — Promote the account. Replace the email with yours.
update public.profiles
set role = 'admin',
    updated_at = now()
where id = (
  select id from auth.users
  where lower(email) = lower('toejam808@gmail.com')
);

-- Confirm it took. Should return one row with role = 'admin'.
select u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';


-- STEP 3 — ONLY if Step 1 showed "NO PROFILE ROW".
-- Accounts created before the on_auth_user_created trigger existed have an
-- auth.users row but no profiles row. The middleware's .single() then returns
-- no data and you get bounced exactly the same way. This backfills it.
--
-- insert into public.profiles (id, email, full_name, role)
-- select u.id, u.email, u.raw_user_meta_data->>'full_name', 'admin'
-- from auth.users u
-- where lower(u.email) = lower('toejam808@gmail.com')
--   and not exists (select 1 from public.profiles p where p.id = u.id);


-- ============================================================================
-- AFTER RUNNING: sign out and back in. The middleware reads the role on each
-- request, but your browser may be holding a cached redirect for /admin.
-- ============================================================================
