"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database.types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 1000 * 60 * 10,
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

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("organization_id", orgId)
        .order("name");

      if (error) throw error;
      const deduped = Array.from(new Map((data ?? []).map((item) => [item.id, item])).values());
      return deduped as Category[];
    }
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Category>) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("categories").insert(payload).select().single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Category> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
  });
}
