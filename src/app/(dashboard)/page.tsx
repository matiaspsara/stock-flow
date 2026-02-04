"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDateRange } from "@/hooks/useDateRange";
import { useDashboardMetrics, useSalesReport, useProductPerformance } from "@/hooks/useReports";
import { useLowStockProducts } from "@/hooks/useInventoryStats";
import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
  const { range } = useDateRange("7d");
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics(range);
  const { data: salesReport, isLoading: loadingSales } = useSalesReport(range);
  const { data: productPerformance, isLoading: loadingProducts } = useProductPerformance(range);
  const { data: lowStock, isLoading: loadingLowStock } = useLowStockProducts();
  const hasSales = (salesReport?.sales ?? []).length > 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loadingMetrics || loadingSales ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={`metric-skel-${index}`}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="grid gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top productos (7 días)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loadingProducts ? (
              <div className="grid gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`top-skel-${index}`} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              (productPerformance ?? []).slice(0, 6).map((row: any) => (
                <div key={row.product} className="flex items-center justify-between text-sm">
                  <span className="truncate">{row.product}</span>
                  <span>{formatCurrency(row.revenue)}</span>
                </div>
              ))
            )}
            {!productPerformance?.length && (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Aún no hay ventas para mostrar productos destacados.
              </div>
            )}
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
            {loadingSales ? (
              <div className="grid gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`sale-skel-${index}`} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              (salesReport?.sales ?? []).slice(0, 6).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between text-sm">
                  <span>{sale.sale_number}</span>
                  <span>{formatCurrency(Number(sale.final_amount))}</span>
                </div>
              ))
            )}
            {!hasSales && (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Todavía no hay ventas registradas en este período.
              </div>
            )}
            <Link className="text-sm text-primary underline" href="/sales">
              Ver ventas
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/pos">Nueva venta</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/products">Agregar producto</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/purchases/new">Nueva compra</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/inventory/adjustments">Ajustar stock</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas de stock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loadingLowStock ? (
              <div className="grid gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`low-skel-${index}`} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              (lowStock ?? []).slice(0, 6).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{product.name}</span>
                  <span className="text-muted-foreground">
                    {product.current_stock} / {product.min_stock_threshold}
                  </span>
                </div>
              ))
            )}
            {!lowStock?.length && (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No hay productos con stock bajo.
              </div>
            )}
            <Link className="text-sm text-primary underline" href="/inventory/alerts">
              Ver alertas
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
