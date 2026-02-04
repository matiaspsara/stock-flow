"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import { useSuppliers, useDeleteSupplier } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/loading-skeletons";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const { data: suppliers = [], isLoading } = useSuppliers({ search, status: status === "all" ? undefined : status });
  const deactivateSupplier = useDeleteSupplier();

  const handleDeactivate = async (id: string) => {
    await deactivateSupplier.mutateAsync(id);
    toast.success("Proveedor desactivado");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Proveedores</CardTitle>
          <p className="text-sm text-muted-foreground">{suppliers.length} proveedores</p>
        </div>
        <SupplierFormDialog />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input placeholder="Buscar proveedor" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onValueChange={(value) => setStatus(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton columns={7} rows={6} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CUIT</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person ?? "-"}</TableCell>
                  <TableCell>{supplier.phone ?? "-"}</TableCell>
                  <TableCell>{supplier.email ?? "-"}</TableCell>
                  <TableCell>{supplier.tax_id ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.is_active ? "success" : "secondary"}>
                      {supplier.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SupplierFormDialog supplier={supplier} />
                      <Button variant="ghost" size="sm" onClick={() => handleDeactivate(supplier.id)}>
                        Desactivar
                      </Button>
                      <Link href={`/purchases?supplier=${supplier.id}`} className="text-sm text-primary underline">
                        Ver compras
                      </Link>
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
