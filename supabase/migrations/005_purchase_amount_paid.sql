alter table public.purchases
  add column if not exists amount_paid numeric(12,2);
