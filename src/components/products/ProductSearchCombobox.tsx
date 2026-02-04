"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/database.types";

export function ProductSearchCombobox({
  products,
  onSelect
}: {
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.barcode ?? "").toLowerCase().includes(term)
    );
  }, [products, query]);

  return (
    <div className="relative">
      <Input
        placeholder="Buscar producto..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-border bg-background shadow-lg">
          {filtered.slice(0, 8).map((product) => (
            <button
              key={product.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
              )}
              onClick={() => {
                onSelect(product);
                setQuery("");
                setOpen(false);
              }}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded bg-muted">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.sku}</div>
              </div>
              <div className="text-xs text-muted-foreground">{product.current_stock} u.</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
