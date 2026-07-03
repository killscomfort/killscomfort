-- Admin full access to Street Run leaderboard (authenticated admins via is_admin())
drop policy if exists "street_run_scores_admin" on public.street_run_scores;

create policy "street_run_scores_admin"
  on public.street_run_scores
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant delete on public.street_run_scores to authenticated;
