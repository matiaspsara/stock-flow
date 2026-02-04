"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { useDateRange } from "@/hooks/useDateRange";
import { useInventoryReport } from "@/hooks/useReports";

export default function InventoryReportPage() {
  const { range, setRange } = useDateRange("30d");
  const { data } = useInventoryReport(range);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporte de inventario</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DateRangeSelector value={range} onChange={setRange} />
        <div className="grid gap-2 text-sm">
          <div>Stock agregado: {data?.added ?? 0}</div>
          <div>Stock reducido: {data?.removed ?? 0}</div>
          <div>Movimientos: {data?.movements?.length ?? 0}</div>
        </div>
      </CardContent>
    </Card>
  );
}
