import { Badge } from "@/components/ui/badge";

export function StockBadge({
  currentStock,
  minThreshold
}: {
  currentStock: number;
  minThreshold: number;
}) {
  if (currentStock <= 0) {
    return <Badge variant="destructive">Sin stock</Badge>;
  }
  if (currentStock <= minThreshold) {
    return <Badge variant="warning">Stock bajo</Badge>;
  }
  return <Badge variant="success">En stock</Badge>;
}
