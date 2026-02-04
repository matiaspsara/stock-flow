-- StockFlow initial schema

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.app_role as enum ('owner', 'manager', 'employee');
create type public.payment_method as enum ('cash', 'card', 'transfer', 'credit');
create type public.payment_status as enum ('paid', 'pending', 'partial');
create type public.inventory_movement_type as enum ('purchase', 'sale', 'adjustment', 'return');
create type public.notification_type as enum ('low_stock', 'out_of_stock', 'system');

-- Helper function (doesn't reference tables)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core tables
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  tax_id text,
  phone text,
  email text,
  currency text not null default 'ARS',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_org_unique unique (organization_id, email)
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  constraint user_roles_unique unique (organization_id, user_id)
);

-- Helper functions (require user_roles table to exist)
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.user_roles ur
    where ur.organization_id = org_id
      and ur.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(org_id uuid, roles public.app_role[])
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.user_roles ur
    where ur.organization_id = org_id
      and ur.user_id = auth.uid()
      and ur.role = any(roles)
  );
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  constraint categories_name_org_unique unique (organization_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  sku text not null,
  barcode text,
  category_id uuid references public.categories(id) on delete set null,
  cost_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  current_stock integer not null default 0,
  min_stock_threshold integer not null default 5,
  unit text not null default 'unit',
  image_url text,
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_sku_org_unique unique (organization_id, sku)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  tax_id text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  purchase_number text not null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  total_amount numeric(12,2) not null default 0,
  payment_status public.payment_status not null default 'pending',
  invoice_number text,
  received_date date,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  unit_cost numeric(12,2) not null,
  subtotal numeric(12,2) not null
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sale_number text not null,
  total_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  final_amount numeric(12,2) not null default 0,
  payment_method public.payment_method not null default 'cash',
  payment_status public.payment_status not null default 'paid',
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text,
  sold_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  subtotal numeric(12,2) not null
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  unit_cost numeric(12,2),
  reference_id uuid,
  notes text,
  performed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text,
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organization_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  store_name text not null,
  store_address text,
  tax_id text,
  phone text,
  email text,
  logo_url text,
  receipt_header text,
  receipt_footer text,
  default_tax_rate numeric(5,2) not null default 21,
  currency text not null default 'ARS',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.org_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  counter_type text not null,
  year integer not null,
  value integer not null default 0,
  primary key (organization_id, counter_type, year)
);

-- Indexes
create index if not exists idx_users_org on public.users(organization_id);
create index if not exists idx_user_roles_org on public.user_roles(organization_id);
create index if not exists idx_categories_org on public.categories(organization_id);
create index if not exists idx_products_org on public.products(organization_id);
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_barcode on public.products(barcode);
create index if not exists idx_suppliers_org on public.suppliers(organization_id);
create index if not exists idx_purchases_org on public.purchases(organization_id);
create index if not exists idx_sales_org on public.sales(organization_id);
create index if not exists idx_inventory_movements_org on public.inventory_movements(organization_id);
create index if not exists idx_notifications_org on public.notifications(organization_id);

-- Updated_at triggers
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_organization_settings_updated_at
before update on public.organization_settings
for each row execute function public.set_updated_at();

-- Counters for sales/purchases
create or replace function public.next_counter(org_id uuid, p_counter_type text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  counter_value integer;
  current_year integer := extract(year from now());
begin
  insert into public.org_counters (organization_id, counter_type, year, value)
  values (org_id, p_counter_type, current_year, 1)
  on conflict (organization_id, counter_type, year)
  do update set value = public.org_counters.value + 1
  returning value into counter_value;

  return counter_value;
end;
$$;

create or replace function public.assign_sale_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  counter_value integer;
  current_year integer := extract(year from now());
begin
  if new.sale_number is null or new.sale_number = '' then
    counter_value := public.next_counter(new.organization_id, 'sale');
    new.sale_number := 'SALE-' || current_year::text || '-' || lpad(counter_value::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.assign_purchase_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  counter_value integer;
  current_year integer := extract(year from now());
begin
  if new.purchase_number is null or new.purchase_number = '' then
    counter_value := public.next_counter(new.organization_id, 'purchase');
    new.purchase_number := 'PO-' || current_year::text || '-' || lpad(counter_value::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger before_insert_sales_number
before insert on public.sales
for each row execute function public.assign_sale_number();

create trigger before_insert_purchase_number
before insert on public.purchases
for each row execute function public.assign_purchase_number();

-- Inventory movement triggers
create or replace function public.handle_sale_item_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
  new_stock integer;
  org_id uuid;
  sold_by_id uuid;
begin
  select organization_id, sold_by into org_id, sold_by_id
  from public.sales
  where id = new.sale_id;

  select p.current_stock into current_stock
  from public.products p
  where p.id = new.product_id
  for update;

  if current_stock < new.quantity then
    raise exception 'Insufficient stock for product %', new.product_id;
  end if;

  new_stock := current_stock - new.quantity;

  update public.products
  set current_stock = new_stock
  where id = new.product_id;

  insert into public.inventory_movements (
    organization_id,
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    reference_id,
    performed_by
  ) values (
    org_id,
    new.product_id,
    'sale',
    -new.quantity,
    current_stock,
    new_stock,
    new.sale_id,
    sold_by_id
  );

  return new;
end;
$$;

create or replace function public.handle_purchase_item_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
  new_stock integer;
  org_id uuid;
  created_by_id uuid;
begin
  select organization_id, created_by into org_id, created_by_id
  from public.purchases
  where id = new.purchase_id;

  select p.current_stock into current_stock
  from public.products p
  where p.id = new.product_id
  for update;

  new_stock := current_stock + new.quantity;

  update public.products
  set current_stock = new_stock
  where id = new.product_id;

  insert into public.inventory_movements (
    organization_id,
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    unit_cost,
    reference_id,
    performed_by
  ) values (
    org_id,
    new.product_id,
    'purchase',
    new.quantity,
    current_stock,
    new_stock,
    new.unit_cost,
    new.purchase_id,
    created_by_id
  );

  return new;
end;
$$;

create trigger after_insert_sale_items
after insert on public.sale_items
for each row execute function public.handle_sale_item_insert();

create trigger after_insert_purchase_items
after insert on public.purchase_items
for each row execute function public.handle_purchase_item_insert();

-- RLS
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.notifications enable row level security;
alter table public.organization_settings enable row level security;
alter table public.org_counters enable row level security;

-- Organizations policies
create policy "Organizations select" on public.organizations
for select using (public.is_org_member(id));

create policy "Organizations insert" on public.organizations
for insert with check (auth.uid() = owner_id);

create policy "Organizations update" on public.organizations
for update using (public.has_org_role(id, array['owner']::public.app_role[]));

create policy "Organizations delete" on public.organizations
for delete using (public.has_org_role(id, array['owner']::public.app_role[]));

-- Users policies
create policy "Users select" on public.users
for select using (public.is_org_member(organization_id));

create policy "Users insert self" on public.users
for insert with check (
  id = auth.uid()
  and exists (
    select 1 from public.organizations o
    where o.id = organization_id and o.owner_id = auth.uid()
  )
);

create policy "Users update self" on public.users
for update using (id = auth.uid());

-- User roles policies
create policy "User roles select" on public.user_roles
for select using (
  user_id = auth.uid() or public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[])
);

create policy "User roles manage" on public.user_roles
for all using (public.has_org_role(organization_id, array['owner']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner']::public.app_role[]));

-- Categories policies
create policy "Categories select" on public.categories
for select using (public.is_org_member(organization_id));

create policy "Categories write" on public.categories
for all using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

-- Products policies
create policy "Products select" on public.products
for select using (public.is_org_member(organization_id));

create policy "Products write" on public.products
for all using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

-- Suppliers policies
create policy "Suppliers select" on public.suppliers
for select using (public.is_org_member(organization_id));

create policy "Suppliers write" on public.suppliers
for all using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

-- Purchases policies
create policy "Purchases select" on public.purchases
for select using (public.is_org_member(organization_id));

create policy "Purchases write" on public.purchases
for all using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

create policy "Purchase items select" on public.purchase_items
for select using (
  exists (
    select 1 from public.purchases p
    where p.id = purchase_id and public.is_org_member(p.organization_id)
  )
);

create policy "Purchase items write" on public.purchase_items
for all using (
  exists (
    select 1 from public.purchases p
    where p.id = purchase_id and public.has_org_role(p.organization_id, array['owner', 'manager']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.purchases p
    where p.id = purchase_id and public.has_org_role(p.organization_id, array['owner', 'manager']::public.app_role[])
  )
);

-- Sales policies
create policy "Sales select" on public.sales
for select using (public.is_org_member(organization_id));

create policy "Sales insert" on public.sales
for insert with check (public.has_org_role(organization_id, array['owner', 'manager', 'employee']::public.app_role[]));

create policy "Sales update" on public.sales
for update using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

create policy "Sales delete" on public.sales
for delete using (public.has_org_role(organization_id, array['owner']::public.app_role[]));

create policy "Sale items select" on public.sale_items
for select using (
  exists (
    select 1 from public.sales s
    where s.id = sale_id and public.is_org_member(s.organization_id)
  )
);

create policy "Sale items insert" on public.sale_items
for insert with check (
  exists (
    select 1 from public.sales s
    where s.id = sale_id and public.has_org_role(s.organization_id, array['owner', 'manager', 'employee']::public.app_role[])
  )
);

create policy "Sale items update" on public.sale_items
for update using (
  exists (
    select 1 from public.sales s
    where s.id = sale_id and public.has_org_role(s.organization_id, array['owner', 'manager']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.sales s
    where s.id = sale_id and public.has_org_role(s.organization_id, array['owner', 'manager']::public.app_role[])
  )
);

create policy "Sale items delete" on public.sale_items
for delete using (
  exists (
    select 1 from public.sales s
    where s.id = sale_id and public.has_org_role(s.organization_id, array['owner']::public.app_role[])
  )
);

-- Inventory movements policies
create policy "Inventory movements select" on public.inventory_movements
for select using (public.is_org_member(organization_id));

create policy "Inventory movements insert" on public.inventory_movements
for insert with check (public.is_org_member(organization_id));

-- Notifications policies
create policy "Notifications select" on public.notifications
for select using (user_id = auth.uid());

create policy "Notifications insert" on public.notifications
for insert with check (public.is_org_member(organization_id));

create policy "Notifications update" on public.notifications
for update using (user_id = auth.uid());

-- Organization settings policies
create policy "Organization settings select" on public.organization_settings
for select using (public.is_org_member(organization_id));

create policy "Organization settings write" on public.organization_settings
for all using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

-- Org counters policies (restricted to owners/managers)
create policy "Org counters manage" on public.org_counters
for all using (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner', 'manager']::public.app_role[]));

-- RPC for onboarding
create or replace function public.create_organization_with_owner(organization_name text, owner_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  user_id uuid := auth.uid();
begin
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, owner_id)
  values (organization_name, user_id)
  returning id into org_id;

  insert into public.users (id, organization_id, email, full_name)
  values (user_id, org_id, (select email from auth.users where id = user_id), owner_name);

  insert into public.user_roles (organization_id, user_id, role)
  values (org_id, user_id, 'owner');

  insert into public.organization_settings (organization_id, store_name)
  values (org_id, organization_name);

  return org_id;
end;
$$;
