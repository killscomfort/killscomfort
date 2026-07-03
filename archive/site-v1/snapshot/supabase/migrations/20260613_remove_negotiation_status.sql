-- Retire negotiation from inquiry pipeline (map legacy values to contacted)
update public.inquiries
set status = 'contacted'
where status in ('negotiation', 'responded', 'read');

alter table public.inquiries drop constraint if exists inquiries_status_check;

alter table public.inquiries add constraint inquiries_status_check check (status in (
  'new', 'contacted', 'deposit_made', 'collect_full_amount', 'prep_for_event', 'archived'
));
