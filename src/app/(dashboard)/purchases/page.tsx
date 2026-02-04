"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePurchases, useMarkPurchaseAsPaid } from "@/hooks/usePurchases";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

export default function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data: purchases = [] } = usePurchases({ search, status: status as any });
  const markPaid = useMarkPurchaseAsPaid();

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Compras</CardTitle>
          <p className="text-sm text-muted-foreground">{purchases.length} órdenes</p>
        </div>
        <Link href="/purchases/new">
          <Button>Nueva compra</Button>
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input placeholder="Buscar por número o factura" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status ?? "all"} onValueChange={(value) => setStatus(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase: any) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.purchase_number}</TableCell>
                <TableCell>{formatDate(purchase.created_at)}</TableCell>
                <TableCell>{purchase.suppliers?.name ?? "-"}</TableCell>
                <TableCell>{formatCurrency(Number(purchase.total_amount))}</TableCell>
                <TableCell>
                  <Badge variant={purchase.payment_status === "paid" ? "success" : "warning"}>
                    {purchase.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>{purchase.invoice_number ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/purchases/${purchase.id}`} className="text-sm text-primary underline">
                      Ver detalle
                    </Link>
                    {purchase.payment_status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid.mutateAsync(purchase.id)}>
                        Marcar pagada
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
