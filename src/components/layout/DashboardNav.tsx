import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/pos", label: "Punto de Venta" },
  { href: "/products", label: "Productos" },
  { href: "/inventory", label: "Inventario" },
  { href: "/sales", label: "Ventas" },
  { href: "/purchases", label: "Compras" },
  { href: "/suppliers", label: "Proveedores" },
  { href: "/reports", label: "Reportes" },
  { href: "/notifications", label: "Notificaciones" },
  { href: "/settings/organization", label: "Configuración" }
];

export function DashboardNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
