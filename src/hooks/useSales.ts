"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PaymentMethod, PaymentStatus, Sale, SaleItem } from "@/types/database.types";

export type SaleFilters = {
  from?: string;
  to?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useSales(filters: SaleFilters = {}) {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: async () => {
      const supabase = createClient();
      const pageSize = filters.pageSize ?? 20;
      const page = filters.page ?? 1;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from("sales").select("*", { count: "exact" }).range(from, to).order("created_at", { ascending: false });

      if (filters.paymentMethod) query = query.eq("payment_method", filters.paymentMethod);
      if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
      if (filters.search) query = query.or(`sale_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
      if (filters.from) query = query.gte("created_at", filters.from);
      if (filters.to) query = query.lte("created_at", filters.to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data as Sale[], count: count ?? 0 };
    }
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data: sale, error } = await supabase.from("sales").select("*").eq("id", id).single();
      if (error) throw error;
      const { data: items } = await supabase.from("sale_items").select("*").eq("sale_id", id);
      return { sale: sale as Sale, items: (items ?? []) as SaleItem[] };
    },
    enabled: Boolean(id)
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("process_sale_transaction", payload);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

export function useTodaySalesStats() {
  return useQuery({
    queryKey: ["sales-today"],
    queryFn: async () => {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", `${today}T00:00:00.000Z`);
      if (error) throw error;
      const total = (data ?? []).reduce((sum, row) => sum + Number(row.total_amount), 0);
      return { total, count: data?.length ?? 0 };
    }
  });
}
