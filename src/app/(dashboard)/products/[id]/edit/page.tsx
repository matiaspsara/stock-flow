import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/products/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar producto</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductForm mode="edit" initialData={product ?? undefined} />
      </CardContent>
    </Card>
  );
}
