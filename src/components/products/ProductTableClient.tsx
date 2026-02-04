"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockBadge } from "@/components/products/StockBadge";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product, Category } from "@/types/database.types";
import { useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";

export function ProductTableClient({
  products,
  categories
}: {
  products: Product[];
  categories: Category[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const categoryMap = useMemo(() => new Map(categories.map((cat) => [cat.id, cat])), [categories]);
  const deleteMutation = useDeleteProduct();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar producto? Se desactivará del catálogo.")) return;
    setDeleting(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Producto desactivado");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo eliminar");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Barcode</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const category = product.category_id ? categoryMap.get(product.category_id) : null;
          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.unit}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{product.barcode ?? "-"}</TableCell>
              <TableCell>
                {category ? (
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-xs"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color ?? "#3B82F6" }} />
                    {category.name}
                  </span>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{formatCurrency(Number(product.selling_price))}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StockBadge currentStock={product.current_stock} minThreshold={product.min_stock_threshold} />
                  <span className="text-xs text-muted-foreground">{product.current_stock}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Acciones</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/products/${product.id}/edit`}>Editar</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/products/${product.id}/history`}>Historial</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
