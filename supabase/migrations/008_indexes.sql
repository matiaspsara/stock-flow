create index if not exists idx_products_barcode on public.products(barcode);
create index if not exists idx_products_org_active on public.products(organization_id, is_active);
create index if not exists idx_sales_org_date on public.sales(organization_id, created_at desc);
create index if not exists idx_inventory_movements_org_date on public.inventory_movements(organization_id, created_at desc);
