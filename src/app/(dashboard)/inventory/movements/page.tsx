"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryMovements } from "@/hooks/useInventoryMovements";
import { formatDate } from "@/lib/utils/dates";
import { downloadCsv } from "@/lib/utils/csv";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/loading-skeletons";

const typeLabel: Record<string, string> = {
  sale: "Venta",
  purchase: "Compra",
  adjustment: "Ajuste",
  return: "Devolución"
};

export default function MovementsPage() {
  const [type, setType] = useState<string>("all");
  const { data: movements = [], isLoading } = useInventoryMovements({ type: type === "all" ? undefined : (type as any) });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos de inventario</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex gap-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sale">Ventas</SelectItem>
              <SelectItem value="purchase">Compras</SelectItem>
              <SelectItem value="adjustment">Ajustes</SelectItem>
              <SelectItem value="return">Devoluciones</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              const rows = [
                ["Fecha", "Producto", "Tipo", "Cantidad", "Stock anterior", "Nuevo stock", "Usuario", "Notas"],
                ...movements.map((movement: any) => [
                  formatDate(movement.created_at),
                  movement.products?.name ?? "-",
                  typeLabel[movement.movement_type] ?? movement.movement_type,
                  movement.quantity,
                  movement.previous_stock,
                  movement.new_stock,
                  movement.users?.full_name ?? "-",
                  movement.notes ?? ""
                ])
              ];
              downloadCsv(`movimientos-${new Date().toISOString().slice(0, 10)}.csv`, rows);
            }}
          >
            Exportar CSV
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton columns={7} rows={6} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Stock anterior</TableHead>
                <TableHead>Nuevo stock</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement: any) => (
                <TableRow key={movement.id}>
                  <TableCell>{formatDate(movement.created_at)}</TableCell>
                  <TableCell>{movement.products?.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{typeLabel[movement.movement_type] ?? movement.movement_type}</Badge>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.previous_stock}</TableCell>
                  <TableCell>{movement.new_stock}</TableCell>
                  <TableCell>{movement.users?.full_name ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
