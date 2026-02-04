"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDateRange } from "@/hooks/useDateRange";
import { useDashboardMetrics, useSalesReport, useProductPerformance } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
  const { range } = useDateRange("7d");
  const { data: metrics } = useDashboardMetrics(range);
  const { data: salesReport } = useSalesReport(range);
  const { data: productPerformance } = useProductPerformance(range);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ventas (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(metrics?.totalRevenue ?? 0)}</div>
            <div className="text-xs text-muted-foreground">{metrics?.transactions ?? 0} transacciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ticket promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(metrics?.avgTransaction ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Valor inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(metrics?.inventoryValue ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Descuentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(salesReport?.totalDiscounts ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top productos (7 días)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {(productPerformance ?? []).slice(0, 6).map((row: any) => (
              <div key={row.product} className="flex items-center justify-between text-sm">
                <span>{row.product}</span>
                <span>{formatCurrency(row.revenue)}</span>
              </div>
            ))}
            <Link className="text-sm text-primary underline" href="/reports/products">
              Ver reporte completo
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ventas recientes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {(salesReport?.sales ?? []).slice(0, 6).map((sale: any) => (
              <div key={sale.id} className="flex items-center justify-between text-sm">
                <span>{sale.sale_number}</span>
                <span>{formatCurrency(Number(sale.final_amount))}</span>
              </div>
            ))}
            <Link className="text-sm text-primary underline" href="/sales">
              Ver ventas
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
