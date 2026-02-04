"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Purchase, PurchaseItem } from "@/types/database.types";

export type PurchaseFilters = {
  supplierId?: string;
  status?: "paid" | "pending" | "partial";
  search?: string;
};

export function usePurchases(filters?: PurchaseFilters) {
  return useQuery({
    queryKey: ["purchases", filters],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("purchases")
        .select("*, suppliers(name)")
        .order("created_at", { ascending: false });
      if (filters?.supplierId) query = query.eq("supplier_id", filters.supplierId);
      if (filters?.status) query = query.eq("payment_status", filters.status);
      if (filters?.search) query = query.or(`purchase_number.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as (Purchase & { suppliers?: { name: string } })[];
    }
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data: purchase, error } = await supabase.from("purchases").select("*, suppliers(name), users(full_name)").eq("id", id).single();
      if (error) throw error;
      const { data: items } = await supabase.from("purchase_items").select("*, products(sku,name)").eq("purchase_id", id);
      return { purchase: purchase as Purchase, items: (items ?? []) as (PurchaseItem & { products?: { sku: string; name: string } })[] };
    },
    enabled: Boolean(id)
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { purchase: Partial<Purchase>; items: Partial<PurchaseItem>[] }) => {
      const supabase = createClient();
      const { data: purchase, error } = await supabase.from("purchases").insert(payload.purchase).select().single();
      if (error) throw error;
      const purchaseId = purchase.id;
      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(payload.items.map((item) => ({ ...item, purchase_id: purchaseId })));
      if (itemsError) throw itemsError;
      return purchaseId as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Purchase> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("purchases").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data as Purchase;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] })
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("purchases").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] })
  });
}

export function useMarkPurchaseAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("purchases").update({ payment_status: "paid" }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] })
  });
}
