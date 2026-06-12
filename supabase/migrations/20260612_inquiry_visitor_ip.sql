alter table public.inquiries
  add column if not exists visitor_ip text;
