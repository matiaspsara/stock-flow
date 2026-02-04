"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { InventoryMovement } from "@/types/database.types";

export type MovementFilters = {
  productId?: string;
  type?: "sale" | "purchase" | "adjustment" | "return";
};

export function useInventoryMovements(filters?: MovementFilters) {
  return useQuery({
    queryKey: ["inventory-movements", filters],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("inventory_movements")
        .select("*, products(name), users(full_name)")
        .order("created_at", { ascending: false });
      if (filters?.productId) query = query.eq("product_id", filters.productId);
      if (filters?.type) query = query.eq("movement_type", filters.type);
      const { data, error } = await query;
      if (error) throw error;
      return data as (InventoryMovement & { products?: { name: string }; users?: { full_name: string } })[];
    }
  });
}

export function useProductMovements(productId: string) {
  return useInventoryMovements({ productId });
}

export function useCreateAdjustment() {
  return useMutation({
    mutationFn: async (payload: { product_id: string; quantity: number; adjustment_type: "increase" | "decrease"; reason: string; notes?: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("adjust_stock", payload);
      if (error) throw error;
      return data;
    }
  });
}
