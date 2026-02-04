import type { ReactNode } from "react";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
          <DemoBanner />
          <OfflineBanner />
          <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div className="min-w-0">
                <p className="hidden text-xs text-muted-foreground sm:block sm:text-sm">Bienvenido</p>
                <p className="truncate text-base font-semibold sm:text-lg">Librería Papelito</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <NotificationBell />
              <div className="hidden text-sm text-muted-foreground md:block">Usuario</div>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
