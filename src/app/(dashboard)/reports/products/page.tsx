"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { useDateRange } from "@/hooks/useDateRange";
import { useProductPerformance } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProductReportPage() {
  const { range, setRange } = useDateRange("30d");
  const { data = [] } = useProductPerformance(range);
  const [search, setSearch] = useState("");

  const filtered = data.filter((row: any) => row.product.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento de productos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DateRangeSelector value={range} onChange={setRange} />
        <input
          className="h-9 rounded-md border border-input px-3 text-sm"
          placeholder="Buscar producto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Unidades</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Ganancia</TableHead>
              <TableHead>Margen %</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row: any) => (
              <TableRow key={row.product}>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.units}</TableCell>
                <TableCell>{formatCurrency(row.revenue)}</TableCell>
                <TableCell>{formatCurrency(row.cogs)}</TableCell>
                <TableCell>{formatCurrency(row.profit)}</TableCell>
                <TableCell>{row.margin.toFixed(1)}%</TableCell>
                <TableCell>{row.current_stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
