-- Street Run: allow score inserts via anon API (validated in Next route)
drop policy if exists "street_run_scores_insert" on public.street_run_scores;

create policy "street_run_scores_insert"
  on public.street_run_scores
  for insert
  to anon, authenticated
  with check (
    char_length(trim(email)) >= 3
    and score >= 0
    and score <= 9999999
    and (character is null or character in ('boy', 'girl'))
  );

grant insert on public.street_run_scores to anon, authenticated;
grant select on public.street_run_scores to anon, authenticated;
