"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mainNav = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/pos", label: "Punto de Venta" },
  { href: "/products", label: "Productos" },
  { href: "/sales", label: "Ventas" },
  { href: "/purchases", label: "Compras" },
  { href: "/inventory", label: "Inventario" },
  { href: "/reports", label: "Reportes" }
];

const moreNav = [
  { href: "/suppliers", label: "Proveedores" },
  { href: "/notifications", label: "Notificaciones" },
  { href: "/settings/organization", label: "Configuración" }
];

export function DashboardNav({
  className,
  onNavigate
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {mainNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="mt-2 inline-flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            type="button"
          >
            Más
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {moreNav.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(isActive(item.href) && "font-semibold")}
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
