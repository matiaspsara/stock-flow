"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { useDateRange } from "@/hooks/useDateRange";
import { useSalesReport } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { downloadCsv } from "@/lib/utils/csv";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/loading-skeletons";

export default function SalesReportPage() {
  const { range, setRange } = useDateRange("30d");
  const { data, isLoading } = useSalesReport(range);

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const filtered = (data?.sales ?? []).filter((sale: any) => {
    if (minAmount && Number(sale.final_amount) < Number(minAmount)) return false;
    if (maxAmount && Number(sale.final_amount) > Number(maxAmount)) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de ventas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DateRangeSelector value={range} onChange={setRange} />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mínimo"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="h-9 rounded-md border border-input px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Máximo"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="h-9 rounded-md border border-input px-3 text-sm"
          />
          <Button
            variant="outline"
            onClick={() => {
              const rows = [
                ["Venta", "Fecha", "Total", "Método"],
                ...filtered.map((sale: any) => [
                  sale.sale_number,
                  formatDate(sale.created_at),
                  sale.final_amount,
                  sale.payment_method
                ])
              ];
              downloadCsv(`sales-report-${range.from}-to-${range.to}.csv`, rows);
            }}
          >
            Exportar CSV
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton columns={4} rows={8} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.sale_number}</TableCell>
                  <TableCell>{formatDate(sale.created_at)}</TableCell>
                  <TableCell>{formatCurrency(Number(sale.final_amount))}</TableCell>
                  <TableCell>{sale.payment_method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
