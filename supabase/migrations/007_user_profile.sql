alter table public.users
  add column if not exists phone text,
  add column if not exists timezone text,
  add column if not exists language text;
