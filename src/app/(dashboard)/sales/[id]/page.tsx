"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSale } from "@/hooks/useSales";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { SendReceiptButton } from "@/components/sales/SendReceiptButton";

export default function SaleDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data } = useSale(id);

  if (!data) return null;

  const { sale, items } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venta {sale.sale_number}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{sale.payment_method}</Badge>
          <Badge variant={sale.payment_status === "paid" ? "success" : "warning"}>{sale.payment_status}</Badge>
          <span className="text-sm text-muted-foreground">{formatDate(sale.created_at)}</span>
          <SendReceiptButton saleId={sale.id} defaultEmail={sale.customer_email} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(Number(item.unit_price))}</TableCell>
                <TableCell>{formatCurrency(Number(item.subtotal))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="ml-auto w-full max-w-sm rounded-md border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(sale.total_amount))}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Descuento</span>
            <span>-{formatCurrency(Number(sale.discount_amount))}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(Number(sale.final_amount))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
