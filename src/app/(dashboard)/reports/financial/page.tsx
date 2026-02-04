"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { useDateRange } from "@/hooks/useDateRange";
import { useFinancialSummary } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialReportPage() {
  const { range, setRange } = useDateRange("30d");
  const { data, isLoading } = useFinancialSummary(range);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen financiero</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DateRangeSelector value={range} onChange={setRange} />
        {isLoading ? (
          <div className="grid gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="grid gap-2 text-sm">
            <div>Ingresos: {formatCurrency(data?.revenue ?? 0)}</div>
            <div>COGS: {formatCurrency(data?.cogs ?? 0)}</div>
            <div>Ganancia: {formatCurrency(data?.profit ?? 0)}</div>
            <div>Margen: {(data?.margin ?? 0).toFixed(1)}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
