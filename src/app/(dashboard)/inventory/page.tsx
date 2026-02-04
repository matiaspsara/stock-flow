"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryStats } from "@/hooks/useInventoryStats";
import { formatCurrency } from "@/lib/utils/currency";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Link from "next/link";

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

export default function InventoryDashboardPage() {
  const { data } = useInventoryStats();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Valor de inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(data?.totalValue ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data?.productCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Stock bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data?.lowStockCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Sin stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{data?.outOfStockCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valor por categoría</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data?.byCategory ?? []} dataKey="value" nameKey="name" outerRadius={120}>
                {(data?.byCategory ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/inventory/alerts" className="text-sm text-primary underline">Ver alertas de stock</Link>
        <Link href="/inventory/adjustments" className="text-sm text-primary underline">Ajustar stock</Link>
        <Link href="/inventory/movements" className="text-sm text-primary underline">Ver movimientos</Link>
        <Link href="/purchases/new" className="text-sm text-primary underline">Crear compra</Link>
      </div>
    </div>
  );
}
