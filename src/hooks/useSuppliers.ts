"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Supplier } from "@/types/database.types";

export function useSuppliers(filters?: { search?: string; status?: "active" | "inactive" }) {
  return useQuery({
    queryKey: ["suppliers", filters],
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

      let query = supabase.from("suppliers").select("*").eq("organization_id", orgId).order("name");
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%`);
      }
      if (filters?.status === "active") query = query.eq("is_active", true);
      if (filters?.status === "inactive") query = query.eq("is_active", false);
      const { data, error } = await query;
      if (error) throw error;
      const deduped = Array.from(new Map((data ?? []).map((item) => [item.id, item])).values());
      return deduped as Supplier[];
    }
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Supplier;
    },
    enabled: Boolean(id)
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Supplier>) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("suppliers").insert(payload).select().single();
      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] })
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Supplier> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("suppliers").update(payload).eq("id", id).select().single();
      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] })
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("suppliers").update({ is_active: false }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] })
  });
}
