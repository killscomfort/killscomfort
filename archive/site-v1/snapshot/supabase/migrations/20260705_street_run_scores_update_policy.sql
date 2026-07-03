-- Street Run: allow score updates (personal best upserts) via public API
drop policy if exists "street_run_scores_update" on public.street_run_scores;

create policy "street_run_scores_update"
  on public.street_run_scores
  for update
  to anon, authenticated
  using (true)
  with check (
    char_length(trim(username)) >= 2
    and char_length(trim(username)) <= 20
    and char_length(trim(email)) >= 3
    and score >= 0
    and score <= 9999999
    and (character is null or character in ('boy', 'girl'))
  );

drop policy if exists "street_run_scores_insert" on public.street_run_scores;

create policy "street_run_scores_insert"
  on public.street_run_scores
  for insert
  to anon, authenticated
  with check (
    char_length(trim(username)) >= 2
    and char_length(trim(username)) <= 20
    and char_length(trim(email)) >= 3
    and score >= 0
    and score <= 9999999
    and (character is null or character in ('boy', 'girl'))
  );

grant insert, update on public.street_run_scores to anon, authenticated;
grant select on public.street_run_scores to anon, authenticated;
