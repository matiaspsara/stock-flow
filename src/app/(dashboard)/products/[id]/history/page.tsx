import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductHistoryClient } from "@/components/products/ProductHistoryClient";

export default async function ProductHistoryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: movements = [] } = await supabase
    .from("inventory_movements")
    .select("*, users(full_name), products(name)")
    .eq("product_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-4">
      <Link href="/products" className="text-sm text-muted-foreground">
        ← Volver a productos
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Historial de stock</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductHistoryClient movements={movements} />
        </CardContent>
      </Card>
    </div>
  );
}
