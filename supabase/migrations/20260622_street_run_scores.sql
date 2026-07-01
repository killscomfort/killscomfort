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

-- Anyone can read the leaderboard; inserts go through API (service role)
create policy "street_run_scores_select"
  on public.street_run_scores for select
  using (true);
