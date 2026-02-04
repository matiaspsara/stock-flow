alter table public.organization_settings
  add column if not exists notify_low_stock boolean not null default true,
  add column if not exists notify_out_of_stock boolean not null default true,
  add column if not exists notify_large_sale boolean not null default true,
  add column if not exists large_sale_threshold numeric(12,2) not null default 50000,
  add column if not exists notify_purchase_created boolean not null default true,
  add column if not exists notify_email_low_stock boolean not null default false,
  add column if not exists notify_email_large_sale boolean not null default false;
