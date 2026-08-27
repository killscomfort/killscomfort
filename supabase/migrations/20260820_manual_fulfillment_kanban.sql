-- Manual fulfillment pipeline for merch that does not route to Printful
-- (e.g. Kills Shorts, which Gregory packs and ships himself).
--
-- Adds a Kanban stage to orders plus a flag marking which orders need hands-on
-- fulfillment, so manual orders stop being indistinguishable from Printful ones.

alter table public.orders
  add column if not exists requires_manual_fulfillment boolean not null default false;

alter table public.orders
  add column if not exists fulfillment_stage text not null default 'paid';

alter table public.orders
  drop constraint if exists orders_fulfillment_stage_check;

alter table public.orders
  add constraint orders_fulfillment_stage_check
  check (fulfillment_stage in ('paid', 'packed', 'shipped', 'done'));

-- Free-text note for tracking numbers / carrier / anything Gregory wants on the card.
alter table public.orders
  add column if not exists fulfillment_notes text;

alter table public.orders
  add column if not exists shipped_at timestamptz;

-- Board queries filter on the flag then order by age; index both.
create index if not exists orders_manual_fulfillment_idx
  on public.orders (requires_manual_fulfillment, fulfillment_stage, created_at desc);

-- ---------------------------------------------------------------------------
-- Backfill
-- ---------------------------------------------------------------------------
-- Two groups of historical orders were hand-shipped and never tracked as such:
--   1. Stripe orders containing Kills Shorts — no Printful variant mapping
--      exists for that slug, so the webhook took the manual branch.
--   2. ALL paid PayPal orders with physical goods — the PayPal capture route
--      never calls Printful at all, so even Diamond Hoodie orders were manual.
--
-- Anything older than 7 days has almost certainly already shipped. Those land
-- directly in 'done' rather than 'paid': dropping months of completed orders
-- into the first column would fill the board with false work (and red ageing
-- badges) on first load, with no way to tell it from a real pack queue.
-- Recent orders land in 'paid' so genuinely outstanding ones surface.
--
-- Service-only orders are excluded — they are not shipped goods.

update public.orders o
set
  requires_manual_fulfillment = true,
  fulfillment_stage = case
    when o.created_at < now() - interval '7 days' then 'done'
    else 'paid'
  end
where o.status = 'paid'
  -- Idempotency guard. Without it, re-running this file (the SQL editor is the
  -- expected workflow here) would overwrite fulfillment_stage on every matching
  -- order: work moved to 'packed'/'shipped' gets forced back, and an order that
  -- landed in 'paid' on the first run gets silently flipped to 'done' once it
  -- crosses the 7-day boundary — marking an UNSHIPPED order complete.
  -- Only ever touch rows that have not been flagged yet.
  and o.requires_manual_fulfillment = false
  and exists (
    select 1
    from public.order_items oi
    where oi.order_id = o.id
      and (
        -- Stripe: shorts have no Printful route
        oi.product_slug = 'kills-shorts'
        -- PayPal: nothing on that path is auto-fulfilled
        or o.paypal_capture_id is not null
      )
      -- Physical goods only. Booking/service slugs are not packed and shipped.
      and oi.product_slug in ('kills-shorts', 'diamond-hoodie')
  );
