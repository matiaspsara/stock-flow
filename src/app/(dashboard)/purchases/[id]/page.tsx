"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePurchase } from "@/hooks/usePurchases";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

export default function PurchaseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data } = usePurchase(id);

  if (!data) return null;

  const { purchase, items } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compra {purchase.purchase_number}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <Badge variant={purchase.payment_status === "paid" ? "success" : "warning"}>{purchase.payment_status}</Badge>
          <span className="text-sm text-muted-foreground">{formatDate(purchase.created_at)}</span>
          <span className="text-sm text-muted-foreground">Proveedor: {(purchase as any).suppliers?.name ?? "-"}</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Costo unitario</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.products?.name ?? item.product_id}</TableCell>
                <TableCell>{item.products?.sku ?? "-"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(Number(item.unit_cost))}</TableCell>
                <TableCell>{formatCurrency(Number(item.subtotal))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="ml-auto w-full max-w-sm rounded-md border border-border p-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(Number(purchase.total_amount))}</span>
          </div>
          {purchase.payment_status === "partial" && (
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Monto pagado</span>
                <span>{formatCurrency(Number(purchase.amount_paid ?? 0))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saldo pendiente</span>
                <span>{formatCurrency(Number(purchase.total_amount) - Number(purchase.amount_paid ?? 0))}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
