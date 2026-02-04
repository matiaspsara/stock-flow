"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { useDateRange } from "@/hooks/useDateRange";
import { useEmployeePerformance } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EmployeeReportPage() {
  const { range, setRange } = useDateRange("30d");
  const { data = [] } = useEmployeePerformance(range);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por empleado</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DateRangeSelector value={range} onChange={setRange} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Ventas</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any) => (
              <TableRow key={row.user}>
                <TableCell>{row.user}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell>{formatCurrency(row.revenue)}</TableCell>
                <TableCell>{formatCurrency(row.avg)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
