import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTableClient } from "@/components/products/ProductTableClient";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import { ProductEmptyState } from "@/components/products/ProductEmptyState";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { ProductsSkeleton } from "@/components/products/ProductsSkeleton";
import type { Category, Product } from "@/types/database.types";
import { Suspense } from "react";

async function fetchProducts(searchParams: Record<string, string | string[] | undefined>) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { products: [], categories: [], count: 0 };

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const orgId = roleRow?.[0]?.organization_id;
  if (!orgId) return { products: [], categories: [], count: 0 };

  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "all";
  const stock = typeof searchParams.stock === "string" ? searchParams.stock : "all";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "name";
  const page = Number(searchParams.page ?? 1);
  const pageSize = 50;

  const { data: categories = [] } = await supabase
    .from("categories")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
  }

  if (category !== "all") {
    query = query.eq("category_id", category);
  }

  if (stock === "in") {
    query = query.gt("current_stock", 0);
  }
  if (stock === "out") {
    query = query.eq("current_stock", 0);
  }

  if (sort === "price") query = query.order("selling_price", { ascending: true });
  if (sort === "stock") query = query.order("current_stock", { ascending: false });
  if (sort === "name") query = query.order("name", { ascending: true });

  const { data: products = [], count = 0 } = await query;
  const filteredProducts =
    stock === "low"
      ? (products as Product[]).filter(
          (product) => product.current_stock > 0 && product.current_stock <= product.min_stock_threshold
        )
      : (products as Product[]);

  return {
    products: filteredProducts,
    categories: categories as Category[],
    count: stock === "low" ? filteredProducts.length : count
  };
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { products, categories, count } = await fetchProducts(searchParams);
  const page = Number(searchParams.page ?? 1);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const makePageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === "string") params.set(key, value);
    });
    params.set("page", String(nextPage));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Productos</CardTitle>
            <p className="text-sm text-muted-foreground">Mostrando {count} productos</p>
          </div>
          <AddProductDialog />
        </CardHeader>
        <CardContent className="grid gap-4">
          <ProductsToolbar categories={categories} />
          <Suspense fallback={<ProductsSkeleton />}>
            {products.length === 0 ? (
              <ProductEmptyState />
            ) : (
              <div className="grid gap-4">
                <ProductTableClient products={products} categories={categories} />
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Página {page} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                      {page > 1 && (
                        <a href={makePageHref(page - 1)} className="rounded-md border px-3 py-1">
                          Anterior
                        </a>
                      )}
                      {page < totalPages && (
                        <a href={makePageHref(page + 1)} className="rounded-md border px-3 py-1">
                          Siguiente
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
