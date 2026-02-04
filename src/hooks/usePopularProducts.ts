"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database.types";

export function usePopularProducts() {
  return useQuery({
    queryKey: ["popular-products"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sale_items")
        .select("product_id, product_name, quantity, products(*)")
        .limit(200);

      if (error) throw error;

      const map = new Map<string, { product: Product; qty: number }>();
      (data ?? []).forEach((row: any) => {
        if (!row.products) return;
        const current = map.get(row.product_id);
        if (!current) {
          map.set(row.product_id, { product: row.products, qty: row.quantity });
        } else {
          current.qty += row.quantity;
        }
      });

      return Array.from(map.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 12)
        .map((entry) => entry.product);
    }
  });
}
