"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database.types";

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  stockStatus?: "in" | "low" | "out";
  sort?: "name" | "price" | "stock";
  page?: number;
  pageSize?: number;
};

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const supabase = createClient();

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const orgId = roleRow?.[0]?.organization_id;
      if (!orgId) throw new Error("Sin organización");

      const pageSize = filters.pageSize ?? 50;
      const page = filters.page ?? 1;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*, categories(name,color)", { count: "exact" })
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .range(from, to);

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`
        );
      }

      if (filters.categoryId && filters.categoryId !== "all") {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.stockStatus === "in") {
        query = query.gt("current_stock", 0);
      }
      if (filters.stockStatus === "out") {
        query = query.eq("current_stock", 0);
      }

      if (filters.sort === "price") query = query.order("selling_price", { ascending: true });
      if (filters.sort === "stock") query = query.order("current_stock", { ascending: false });
      if (filters.sort === "name") query = query.order("name", { ascending: true });

      const { data, error, count } = await query;
      if (error) throw error;
      const filtered =
        filters.stockStatus === "low"
          ? (data as Product[]).filter(
              (product) => product.current_stock > 0 && product.current_stock <= product.min_stock_threshold
            )
          : (data as Product[]);
      return { data: filtered, count: filters.stockStatus === "low" ? filtered.length : count ?? 0 };
    }
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Product;
    },
    enabled: Boolean(id)
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      if (error) throw error;
      return data as Product;
    },
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueriesData({ queryKey: ["products"] });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Product> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueriesData({ queryKey: ["products"] });
      queryClient.setQueriesData({ queryKey: ["products"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item: Product) => (item.id === updated.id ? { ...item, ...updated } : item))
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previous = queryClient.getQueriesData({ queryKey: ["products"] });
      queryClient.setQueriesData({ queryKey: ["products"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((item: Product) => item.id !== id)
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}
