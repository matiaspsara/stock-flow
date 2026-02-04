create or replace function public.adjust_stock(
  product_id uuid,
  quantity integer,
  adjustment_type text,
  reason text,
  notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  org_id uuid;
  user_id uuid := auth.uid();
  current_stock integer;
  new_stock integer;
  movement_id uuid;
begin
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  select ur.organization_id into org_id
  from public.user_roles ur
  where ur.user_id = user_id
  order by ur.created_at desc
  limit 1;

  if org_id is null then
    raise exception 'Sin organización';
  end if;

  select current_stock into current_stock
  from public.products
  where id = product_id
  for update;

  if adjustment_type = 'increase' then
    new_stock := current_stock + quantity;
  else
    if current_stock - quantity < 0 then
      raise exception 'Stock no puede ser negativo';
    end if;
    new_stock := current_stock - quantity;
  end if;

  update public.products
  set current_stock = new_stock
  where id = product_id;

  insert into public.inventory_movements (
    organization_id,
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    notes,
    performed_by
  ) values (
    org_id,
    product_id,
    'adjustment',
    case when adjustment_type = 'increase' then quantity else -quantity end,
    current_stock,
    new_stock,
    coalesce(reason, '') || case when notes is not null and notes <> '' then ': ' || notes else '' end,
    user_id
  ) returning id into movement_id;

  return movement_id;
end;
$$;
