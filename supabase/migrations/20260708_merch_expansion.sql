-- KillsComfort merch expansion: order + fulfillment tracking
-- Catalog stays config-driven (src/config/merch.config.ts) so no product tables needed.

create table if not exists merch_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  printful_order_id bigint,
  email text not null,
  customer_name text,
  amount_total_cents integer not null,
  currency text not null default 'usd',
  shipping_address jsonb,
  status text not null default 'paid'
    check (status in ('paid','submitted_to_printful','in_production','shipped','delivered','failed','canceled')),
  failure_reason text,
  tracking_number text,
  tracking_url text
);

create table if not exists merch_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references merch_orders(id) on delete cascade,
  sku text not null,
  product_slug text not null,
  color text not null,
  size text not null,
  quantity integer not null default 1,
  unit_price_cents integer not null
);

create index if not exists merch_orders_status_idx on merch_orders(status);
create index if not exists merch_order_items_order_idx on merch_order_items(order_id);

-- Lock down: only the service role touches these (webhooks use service key).
alter table merch_orders enable row level security;
alter table merch_order_items enable row level security;
