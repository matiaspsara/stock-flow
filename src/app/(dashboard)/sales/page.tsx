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
import { TableSkeleton, CardListSkeleton } from "@/components/ui/loading-skeletons";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);

  const { data, isLoading } = useSales({ search, paymentMethod: paymentMethod as any, paymentStatus: paymentStatus as any });
  const sales = data?.data ?? [];

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

        {isLoading ? (
          <>
            <div className="md:hidden">
              <CardListSkeleton count={4} />
            </div>
            <div className="hidden md:block">
              <TableSkeleton columns={7} rows={6} />
            </div>
          </>
        ) : sales.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No hay ventas registradas todavía. Podés crear una desde el Punto de Venta.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {sales.map((sale) => (
                <div key={sale.id} className="rounded-md border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{sale.sale_number}</span>
                    <span className="text-muted-foreground">{formatDate(sale.created_at)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>{formatCurrency(Number(sale.final_amount))}</span>
                    <Badge variant="secondary">{sale.payment_method}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={sale.payment_status === "paid" ? "success" : "warning"}>{sale.payment_status}</Badge>
                    <span className="text-muted-foreground">{sale.customer_name ?? "-"}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Link href={`/sales/${sale.id}`} className="text-primary underline">
                      Ver detalle
                    </Link>
                    <SendReceiptButton saleId={sale.id} defaultEmail={sale.customer_email} />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
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
                  {sales.map((sale) => (
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
