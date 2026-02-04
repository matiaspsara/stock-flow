import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { StockBadge } from "@/components/products/StockBadge";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/types/database.types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-36 w-full bg-muted/40">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>
      <CardContent className="grid gap-2 p-4">
        <div className="text-sm font-semibold">{product.name}</div>
        <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {formatCurrency(Number(product.selling_price))}
          </span>
          <StockBadge
            currentStock={product.current_stock}
            minThreshold={product.min_stock_threshold}
          />
        </div>
      </CardContent>
    </Card>
  );
}
