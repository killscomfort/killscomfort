-- Street Run high scores (public arcade game)
create table if not exists public.street_run_scores (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  score integer not null check (score >= 0),
  character text check (character in ('boy', 'girl')),
  created_at timestamptz not null default now()
);

create index if not exists street_run_scores_score_idx
  on public.street_run_scores (score desc, created_at desc);

alter table public.street_run_scores enable row level security;

-- Anyone can read the leaderboard
create policy "street_run_scores_select"
  on public.street_run_scores for select
  using (true);

-- Inserts via public API (anon key + route validation)
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
