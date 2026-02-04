"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSales } from "@/hooks/useSales";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { SendReceiptButton } from "@/components/sales/SendReceiptButton";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);

  const { data } = useSales({ search, paymentMethod: paymentMethod as any, paymentStatus: paymentStatus as any });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input placeholder="Buscar por número o cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={paymentMethod ?? "all"} onValueChange={(value) => setPaymentMethod(value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="card">Tarjeta</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="credit">Cuenta corriente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatus ?? "all"} onValueChange={(value) => setPaymentStatus(value === "all" ? undefined : value)}>
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
              <TableHead>Total</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.sale_number}</TableCell>
                <TableCell>{formatDate(sale.created_at)}</TableCell>
                <TableCell>{formatCurrency(Number(sale.final_amount))}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{sale.payment_method}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={sale.payment_status === "paid" ? "success" : "warning"}>{sale.payment_status}</Badge>
                </TableCell>
                <TableCell>{sale.customer_name ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/sales/${sale.id}`} className="text-sm text-primary underline">
                      Ver detalle
                    </Link>
                    <SendReceiptButton saleId={sale.id} defaultEmail={sale.customer_email} />
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
