-- Editable ride game copy + content (admin-managed, public read)
create table if not exists public.ride_game_config (
  id text primary key default 'default',
  config jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.ride_game_config (id, config)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.ride_game_config enable row level security;

drop policy if exists "ride_game_config_public_read" on public.ride_game_config;
create policy "ride_game_config_public_read"
  on public.ride_game_config
  for select
  to anon, authenticated
  using (true);

grant select on public.ride_game_config to anon, authenticated;
