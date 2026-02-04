import { AddProductDialog } from "@/components/products/AddProductDialog";

export function ProductEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background p-10 text-center">
      <div className="text-lg font-semibold">No hay productos todavía</div>
      <p className="text-sm text-muted-foreground">
        Agrega tu primer producto para comenzar a gestionar stock y ventas.
      </p>
      <AddProductDialog />
    </div>
  );
}
