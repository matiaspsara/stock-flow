"use client";

import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils/dates";

const typeLabels: Record<string, string> = {
  purchase: "Compra",
  sale: "Venta",
  adjustment: "Ajuste",
  return: "Devolución"
};

const typeVariant: Record<string, "default" | "secondary" | "warning" | "destructive" | "success"> = {
  purchase: "success",
  sale: "destructive",
  adjustment: "warning",
  return: "secondary"
};

export function ProductHistoryClient({
  movements
}: {
  movements: any[];
}) {
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return movements.filter((movement) => {
      if (type !== "all" && movement.movement_type !== type) return false;
      if (from && new Date(movement.created_at) < new Date(from)) return false;
      if (to && new Date(movement.created_at) > new Date(to)) return false;
      return true;
    });
  }, [movements, type, from, to]);

  const handleExport = () => {
    const header = ["Fecha", "Tipo", "Cantidad", "Stock anterior", "Nuevo stock", "Usuario", "Referencia", "Notas"];
    const rows = filtered.map((movement) => [
      formatDate(movement.created_at),
      typeLabels[movement.movement_type] ?? movement.movement_type,
      movement.quantity,
      movement.previous_stock,
      movement.new_stock,
      movement.users?.full_name ?? "",
      movement.reference_id ?? "",
      movement.notes ?? ""
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historial_stock.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="h-10 rounded-md border border-input px-3 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="h-10 rounded-md border border-input px-3 text-sm"
        />
        <Button variant="outline" onClick={handleExport}>
          Exportar CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Stock anterior</TableHead>
            <TableHead>Nuevo stock</TableHead>
            <TableHead>Realizado por</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead>Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{formatDate(movement.created_at)}</TableCell>
              <TableCell>
                <Badge variant={typeVariant[movement.movement_type] ?? "secondary"}>
                  {typeLabels[movement.movement_type] ?? movement.movement_type}
                </Badge>
              </TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>{movement.previous_stock}</TableCell>
              <TableCell>{movement.new_stock}</TableCell>
              <TableCell>{movement.users?.full_name ?? "-"}</TableCell>
              <TableCell>
                {movement.reference_id ? (
                  movement.movement_type === "sale" ? (
                    <a href={`/sales/${movement.reference_id}`} className="text-xs text-primary underline">
                      Ver venta
                    </a>
                  ) : movement.movement_type === "purchase" ? (
                    <a href={`/purchases/${movement.reference_id}`} className="text-xs text-primary underline">
                      Ver compra
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">{movement.reference_id}</span>
                  )
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{movement.notes ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
