"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/database.types";

function updateParam(params: URLSearchParams, key: string, value?: string) {
  const next = new URLSearchParams(params);
  if (!value || value === "all") {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  next.delete("page");
  return next.toString();
}

export function ProductsToolbar({
  categories
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "all";
  const stock = params.get("stock") ?? "all";
  const sort = params.get("sort") ?? "name";

  const categoryOptions = useMemo(
    () => [{ id: "all", name: "Todas" }, ...categories],
    [categories]
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        <Input
          placeholder="Buscar por nombre, SKU o barcode"
          defaultValue={search}
          onChange={(event) => {
            const next = updateParam(params, "search", event.target.value);
            router.replace(`/products?${next}`);
          }}
        />
        <Select
          value={category}
          onValueChange={(value) => router.replace(`/products?${updateParam(params, "category", value)}`)}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={stock}
          onValueChange={(value) => router.replace(`/products?${updateParam(params, "stock", value)}`)}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="in">En stock</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Sin stock</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(value) => router.replace(`/products?${updateParam(params, "sort", value)}`)}
        >
          <SelectTrigger className="min-w-[180px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="price">Precio</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
