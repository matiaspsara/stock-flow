import type { ReactNode } from "react";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex">
        <aside className="hidden w-64 border-r border-border bg-background p-6 lg:block">
          <div className="mb-6">
            <p className="text-lg font-semibold">StockFlow</p>
            <p className="text-xs text-muted-foreground">Inventario & Ventas</p>
          </div>
          <DashboardNav />
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Bienvenido</p>
              <p className="text-lg font-semibold">Librería Papelito</p>
            </div>
            <div className="text-sm text-muted-foreground">Usuario</div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
