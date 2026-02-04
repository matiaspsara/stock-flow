"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLowStockProducts } from "@/hooks/useInventoryStats";
import { useCategories } from "@/hooks/useCategories";

export default function InventoryAlertsPage() {
  const { data: products = [] } = useLowStockProducts();
  const { data: categories = [] } = useCategories();
  const [categoryId, setCategoryId] = useState("all");
  const [severity, setSeverity] = useState("all");

  const filtered = useMemo(() => {
    return products.filter((product: any) => {
      if (categoryId !== "all" && product.category_id !== categoryId) return false;
      if (severity === "out" && product.current_stock !== 0) return false;
      if (severity === "low" && !(product.current_stock > 0 && product.current_stock <= product.min_stock_threshold)) return false;
      return true;
    });
  }, [products, categoryId, severity]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas de stock</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex gap-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="out">Sin stock</SelectItem>
              <SelectItem value="low">Stock bajo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Categoría</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.current_stock === 0 ? "destructive" : "warning"}>
                    {product.current_stock}
                  </Badge>
                </TableCell>
                <TableCell>{product.min_stock_threshold}</TableCell>
                <TableCell>
                  {categories?.find((c) => c.id === product.category_id)?.name ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
