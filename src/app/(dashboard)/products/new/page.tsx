import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo producto</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductForm mode="create" />
      </CardContent>
    </Card>
  );
}
