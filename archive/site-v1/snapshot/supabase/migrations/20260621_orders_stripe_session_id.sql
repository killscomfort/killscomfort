alter table public.orders
  add column if not exists stripe_session_id text unique;

create index if not exists orders_stripe_session_id_idx
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;
