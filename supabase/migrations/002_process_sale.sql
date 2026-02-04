create or replace function public.process_sale_transaction(
  items jsonb,
  discount_amount numeric,
  total_amount numeric,
  final_amount numeric,
  payment_method text,
  payment_status text,
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sale_id uuid;
  org_id uuid;
  user_id uuid := auth.uid();
  item jsonb;
  product_record record;
  qty integer;
  unit_price numeric;
  subtotal numeric;
begin
  if user_id is null then
    raise exception 'Not authenticated';
  end if;

  select ur.organization_id into org_id
  from public.user_roles ur
  where ur.user_id = auth.uid()
  order by created_at desc
  limit 1;

  if org_id is null then
    raise exception 'Sin organización';
  end if;

  insert into public.sales (
    organization_id,
    total_amount,
    discount_amount,
    final_amount,
    payment_method,
    payment_status,
    customer_name,
    customer_email,
    customer_phone,
    notes,
    sold_by
  ) values (
    org_id,
    total_amount,
    discount_amount,
    final_amount,
    payment_method::public.payment_method,
    payment_status::public.payment_status,
    customer_name,
    customer_email,
    customer_phone,
    notes,
    user_id
  ) returning id into sale_id;

  for item in select * from jsonb_array_elements(items)
  loop
    qty := (item->>'quantity')::integer;
    unit_price := (item->>'unit_price')::numeric;
    subtotal := (item->>'subtotal')::numeric;

    select * into product_record
    from public.products
    where id = (item->>'product_id')::uuid
    for update;

    if product_record.current_stock < qty then
      raise exception 'Stock insuficiente para producto %', product_record.name;
    end if;

    insert into public.sale_items (
      sale_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    ) values (
      sale_id,
      product_record.id,
      product_record.name,
      qty,
      unit_price,
      subtotal
    );
  end loop;

  return sale_id;
end;
$$;
