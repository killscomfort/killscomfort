-- Street Run: public display name on leaderboard (email stays private for admin)
alter table public.street_run_scores
  add column if not exists username text;

update public.street_run_scores
set username = left(split_part(email, '@', 1), 20)
where username is null or trim(username) = '';

alter table public.street_run_scores
  alter column username set not null;

alter table public.street_run_scores
  drop constraint if exists street_run_scores_username_check;

alter table public.street_run_scores
  add constraint street_run_scores_username_check
  check (
    char_length(trim(username)) >= 2
    and char_length(trim(username)) <= 20
  );

drop policy if exists "street_run_scores_insert" on public.street_run_scores;

create policy "street_run_scores_insert"
  on public.street_run_scores
  for insert
  to anon, authenticated
  with check (
    char_length(trim(email)) >= 3
    and char_length(trim(username)) >= 2
    and char_length(trim(username)) <= 20
    and score >= 0
    and score <= 9999999
    and (character is null or character in ('boy', 'girl'))
  );

grant insert on public.street_run_scores to anon, authenticated;
grant select on public.street_run_scores to anon, authenticated;
