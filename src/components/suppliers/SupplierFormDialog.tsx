"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import type { Supplier } from "@/types/database.types";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function SupplierFormDialog({ supplier }: { supplier?: Supplier }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: supplier?.name ?? "",
    contact_person: supplier?.contact_person ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    address: supplier?.address ?? "",
    tax_id: supplier?.tax_id ?? "",
    notes: supplier?.notes ?? "",
    is_active: supplier?.is_active ?? true
  });

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

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
        .order("created_at", { ascending: false })
        .limit(1);
      const orgId = roleRow?.[0]?.organization_id;
      if (!orgId) throw new Error("Sin organización");

      const { data: existing } = await supabase
        .from("suppliers")
        .select("id")
        .eq("organization_id", orgId)
        .eq("tax_id", form.tax_id)
        .limit(1);
      if (existing && existing.length > 0 && existing[0].id !== supplier?.id) {
        toast.error("CUIT ya existe");
        return;
      }

      if (supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, ...form });
        toast.success("Proveedor actualizado");
      } else {
        await createSupplier.mutateAsync({ ...form, organization_id: orgId });
        toast.success("Proveedor creado");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={supplier ? "ghost" : "default"} size={supplier ? "sm" : "default"}>
          {supplier ? "Editar" : "Agregar proveedor"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Contacto" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="CUIT" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
          <Textarea placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Textarea placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.is_active} onCheckedChange={(value) => setForm({ ...form, is_active: Boolean(value) })} />
            Activo
          </label>
          <Button onClick={handleSubmit}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
