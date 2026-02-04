-- Fix ambiguous current_stock reference in inventory trigger functions
-- Qualify column with table alias so it doesn't conflict with local variable name

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
