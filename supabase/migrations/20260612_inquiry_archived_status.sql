-- Add archived status for inquiry pipeline
alter table public.inquiries drop constraint if exists inquiries_status_check;

alter table public.inquiries add constraint inquiries_status_check check (status in (
  'new', 'contacted', 'negotiation', 'deposit_made', 'collect_full_amount', 'prep_for_event', 'archived'
));
