"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { useDateRange } from "@/hooks/useDateRange";
import { useDashboardMetrics, useSalesReport, useProductPerformance } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/utils/currency";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

export default function ReportsPage() {
  const { range, setRange } = useDateRange("30d");
  const { data: metrics } = useDashboardMetrics(range);
  const { data: salesReport } = useSalesReport(range);
  const { data: productPerformance } = useProductPerformance(range);

  return (
    <div className="grid gap-6">
      <DateRangeSelector value={range} onChange={setRange} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(metrics?.totalRevenue ?? 0)}</div>
            <div className="text-xs text-muted-foreground">{metrics?.transactions ?? 0} ventas</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics?.transactions ?? 0}</div>
            <div className="text-xs text-muted-foreground">Promedio {formatCurrency(metrics?.avgTransaction ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Valor inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(metrics?.inventoryValue ?? 0)}</div>
            <div className="text-xs text-muted-foreground">Costo de stock</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Descuentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(salesReport?.totalDiscounts ?? 0)}</div>
            <div className="text-xs text-muted-foreground">Periodo actual</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por día</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesReport?.salesByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ventas por método</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesReport?.salesByPayment ?? []} dataKey="value" nameKey="method" outerRadius={110}>
                  {(salesReport?.salesByPayment ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-products">
        <TabsList>
          <TabsTrigger value="top-products">Top productos</TabsTrigger>
          <TabsTrigger value="recent-sales">Ventas recientes</TabsTrigger>
          <TabsTrigger value="low-stock">Stock bajo</TabsTrigger>
        </TabsList>
        <TabsContent value="top-products">
          <Card>
            <CardHeader>
              <CardTitle>Top productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {(productPerformance ?? []).slice(0, 10).map((row: any) => (
                  <div key={row.product} className="flex items-center justify-between text-sm">
                    <span>{row.product}</span>
                    <span>{formatCurrency(row.revenue)}</span>
                  </div>
                ))}
              </div>
              <Link className="text-sm text-primary underline" href="/reports/products">
                Ver reporte completo
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent-sales">
          <Card>
            <CardHeader>
              <CardTitle>Ventas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {(salesReport?.sales ?? []).slice(0, 10).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between text-sm">
                  <span>{sale.sale_number}</span>
                  <span>{formatCurrency(Number(sale.final_amount))}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Stock bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <Link className="text-sm text-primary underline" href="/inventory/alerts">
                Ir a alertas de stock
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
