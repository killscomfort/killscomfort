-- Run on existing databases to migrate inquiry statuses for Kanban pipeline
alter table public.inquiries drop constraint if exists inquiries_status_check;

update public.inquiries set status = 'contacted' where status = 'read';
update public.inquiries set status = 'negotiation' where status = 'responded';
update public.inquiries set status = 'prep_for_event' where status = 'archived';

alter table public.inquiries add constraint inquiries_status_check check (status in (
  'new', 'contacted', 'negotiation', 'deposit_made', 'collect_full_amount', 'prep_for_event', 'archived'
));
