"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types/database.types";

export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: products = [] } = await supabase.from("products").select("*");
      const { data: categories = [] } = await supabase.from("categories").select("*");

      const totalValue = (products as Product[]).reduce(
        (sum, product) => sum + Number(product.cost_price) * product.current_stock,
        0
      );
      const lowStock = (products as Product[]).filter(
        (product) => product.current_stock > 0 && product.current_stock <= product.min_stock_threshold
      );
      const outOfStock = (products as Product[]).filter((product) => product.current_stock === 0);

      const byCategory = (categories as Category[]).map((category) => {
        const value = (products as Product[])
          .filter((product) => product.category_id === category.id)
          .reduce((sum, product) => sum + Number(product.cost_price) * product.current_stock, 0);
        return { name: category.name, value };
      });

      return {
        totalValue,
        productCount: (products as Product[]).length,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        byCategory
      };
    }
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return (data as Product[]).filter(
        (product) => product.current_stock <= product.min_stock_threshold
      );
    }
  });
}
