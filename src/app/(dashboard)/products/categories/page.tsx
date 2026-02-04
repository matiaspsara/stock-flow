"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories";
import { toast } from "sonner";
import type { Category } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";

const colorOptions = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6"];

function CategoryDialog({
  initial,
  onSuccess
}: {
  initial?: Category;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? colorOptions[0]);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const handleSubmit = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!roleRow) throw new Error("Sin organización");

      if (initial) {
        await updateCategory.mutateAsync({
          id: initial.id,
          name,
          description,
          color
        });
        toast.success("Categoría actualizada");
      } else {
        await createCategory.mutateAsync({
          organization_id: roleRow.organization_id,
          name,
          description,
          color
        });
        toast.success("Categoría creada");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo guardar la categoría");
    }
  };

  return (
    <div className="grid gap-3">
      <Input placeholder="Nombre" value={name} onChange={(event) => setName(event.target.value)} />
      <Textarea placeholder="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="flex gap-2">
        {colorOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`h-8 w-8 rounded-full border ${color === option ? "border-foreground" : "border-border"}`}
            style={{ backgroundColor: option }}
            onClick={() => setColor(option)}
          />
        ))}
      </div>
      <Button onClick={handleSubmit}>{initial ? "Guardar" : "Crear"}</Button>
    </div>
  );
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  const handleDelete = async (category: Category) => {
    if (!confirm("¿Eliminar categoría?")) return;
    try {
      const supabase = createClient();
      const { data: assigned } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", category.id)
        .limit(1);
      if (assigned && assigned.length > 0) {
        toast.error("La categoría tiene productos asignados.");
        return;
      }
      await deleteCategory.mutateAsync(category.id);
      toast.success("Categoría eliminada");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo eliminar");
    }
  };

  useEffect(() => {
    const loadCounts = async () => {
      const supabase = createClient();
      const { data: products } = await supabase.from("products").select("category_id");
      if (!products) return;
      const map = new Map<string, number>();
      products.forEach((product) => {
        if (!product.category_id) return;
        map.set(product.category_id, (map.get(product.category_id) ?? 0) + 1);
      });
      setCounts(map);
    };
    loadCounts();
  }, []);

  const productsByCategory = useMemo(() => counts, [counts]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorías</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Agregar categoría</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva categoría</DialogTitle>
            </DialogHeader>
            <CategoryDialog onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color ?? "#3B82F6" }} />
                  </TableCell>
                  <TableCell>{productsByCategory.get(category.id) ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editing?.id === category.id}
                        onOpenChange={(value) => setEditing(value ? category : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">Editar</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar categoría</DialogTitle>
                          </DialogHeader>
                          <CategoryDialog initial={category} onSuccess={() => setEditing(null)} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category)}>
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
