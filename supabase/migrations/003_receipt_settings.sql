alter table public.organization_settings
  add column if not exists receipt_from_email text,
  add column if not exists receipt_email_footer text,
  add column if not exists auto_send_receipt boolean not null default false,
  add column if not exists cc_owner_on_receipt boolean not null default false,
  add column if not exists auto_print_receipt boolean not null default false,
  add column if not exists auto_show_receipt_modal boolean not null default true;
