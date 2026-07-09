-- Weekly newsletter draft approval pipeline

create table public.newsletter_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  preheader text,
  content_html text not null default '',
  source_events jsonb not null default '[]',
  status text not null default 'collecting' check (status in (
    'collecting', 'draft', 'in_review', 'approved', 'sent', 'archived'
  )),
  approved_at timestamptz,
  sent_at timestamptz,
  sent_count integer not null default 0 check (sent_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index newsletter_drafts_status_idx on public.newsletter_drafts (status);
create index newsletter_drafts_created_at_idx on public.newsletter_drafts (created_at desc);

alter table public.newsletter_drafts enable row level security;

create policy "Admins full access newsletter drafts" on public.newsletter_drafts
  for all using (public.is_admin());
