"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { useCreateAdjustment, useInventoryMovements } from "@/hooks/useInventoryMovements";
import { formatDate } from "@/lib/utils/dates";
import { toast } from "sonner";
import { useCreateNotification } from "@/hooks/useNotifications";

const reasons = [
  { value: "damaged", label: "Mercadería dañada" },
  { value: "theft", label: "Robo/Pérdida" },
  { value: "count", label: "Ajuste por inventario" },
  { value: "found", label: "Stock encontrado" },
  { value: "expired", label: "Vencidos" },
  { value: "other", label: "Otro" }
];

export default function AdjustmentsPage() {
  const { data: productsData } = useProducts({ pageSize: 200 });
  const { data: movements = [] } = useInventoryMovements({ type: "adjustment" });
  const createAdjustment = useCreateAdjustment();
  const createNotification = useCreateNotification();

  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"increase" | "decrease">("decrease");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("damaged");
  const [notes, setNotes] = useState("");

  const product = useMemo(() => productsData?.data?.find((p) => p.id === productId), [productsData, productId]);
  const newStock = product ? (type === "increase" ? product.current_stock + quantity : product.current_stock - quantity) : 0;

  const handleSubmit = async () => {
    try {
      if (!productId) throw new Error("Selecciona producto");
      if (quantity <= 0) throw new Error("Cantidad inválida");
      if (reason === "other" && notes.trim().length < 2) throw new Error("Agrega notas");

      await createAdjustment.mutateAsync({
        product_id: productId,
        quantity,
        adjustment_type: type,
        reason,
        notes
      });
      toast.success("Ajuste registrado");
      await createNotification.mutateAsync({
        type: "system",
        title: "Ajuste de stock",
        message: `Ajuste ${type === "increase" ? "+" : "-"}${quantity} en ${product?.name ?? ""}`,
        reference_id: productId,
        is_read: false
      });
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo ajustar");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajustes de stock</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Producto" />
            </SelectTrigger>
            <SelectContent>
              {productsData?.data?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={product?.current_stock ?? ""} readOnly placeholder="Stock actual" />
          <Select value={type} onValueChange={(value) => setType(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="increase">Incrementar</SelectItem>
              <SelectItem value="decrease">Disminuir</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Motivo" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={newStock} readOnly placeholder="Nuevo stock" />
        </div>
        <Textarea placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={handleSubmit}>Registrar ajuste</Button>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Historial reciente</div>
          <div className="rounded-md border border-border">
            {movements.slice(0, 10).map((movement: any) => (
              <div key={movement.id} className="grid grid-cols-6 gap-2 border-b p-3 text-sm">
                <div>{formatDate(movement.created_at)}</div>
                <div>{movement.products?.name ?? "-"}</div>
                <div>{movement.quantity}</div>
                <div>{movement.previous_stock}</div>
                <div>{movement.new_stock}</div>
                <div>{movement.notes ?? movement.movement_type}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
