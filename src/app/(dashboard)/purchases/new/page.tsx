"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductSearchCombobox } from "@/components/products/ProductSearchCombobox";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCreateNotification } from "@/hooks/useNotifications";

export default function NewPurchasePage() {
  const { data: suppliers = [] } = useSuppliers();
  const { data: productsData } = useProducts({ pageSize: 100 });
  const createPurchase = useCreatePurchase();
  const createNotification = useCreateNotification();

  const [supplierId, setSupplierId] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending" | "partial">("pending");
  const [amountPaid, setAmountPaid] = useState(0);

  const [items, setItems] = useState<
    { product_id: string; name: string; quantity: number; unit_cost: number }[]
  >([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0),
    [items]
  );

  const addItem = (product: any) => {
    if (items.find((item) => item.product_id === product.id)) return;
    setItems([
      ...items,
      { product_id: product.id, name: product.name, quantity: 1, unit_cost: Number(product.cost_price) }
    ]);
  };

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

      if (!supplierId) throw new Error("Selecciona proveedor");
      if (items.length === 0) throw new Error("Agrega productos");

      const purchaseId = await createPurchase.mutateAsync({
        purchase: {
          organization_id: orgId,
          supplier_id: supplierId,
          total_amount: total,
          payment_status: paymentStatus,
          amount_paid: paymentStatus === "partial" ? amountPaid : paymentStatus === "paid" ? total : 0,
          invoice_number: invoiceNumber,
          received_date: receivedDate,
          notes,
          created_by: user.id
        },
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          subtotal: item.quantity * item.unit_cost
        }))
      });

      toast.success("Compra creada");
      await createNotification.mutateAsync({
        type: "system",
        title: "Nueva compra creada",
        message: `Orden ${purchaseId} por ${formatCurrency(total)}`,
        reference_id: purchaseId as string,
        is_read: false
      });
      window.location.href = `/purchases/${purchaseId}`;
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo crear la compra");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva compra</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger>
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
          <Input placeholder="Factura" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
            </SelectContent>
          </Select>
          {paymentStatus === "partial" && (
            <Input
              type="number"
              placeholder="Monto pagado"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
            />
          )}
        </div>
        <Textarea placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="grid gap-3">
          <ProductSearchCombobox
            products={productsData?.data ?? []}
            onSelect={(product) => addItem(product)}
          />
          <div className="rounded-md border border-border">
            {items.map((item) => (
              <div key={item.product_id} className="grid grid-cols-12 items-center gap-2 border-b p-3">
                <div className="col-span-6 text-sm">{item.name}</div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      setItems(items.map((i) => (i.product_id === item.product_id ? { ...i, quantity: Number(e.target.value) } : i)))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.unit_cost}
                    onChange={(e) =>
                      setItems(items.map((i) => (i.product_id === item.product_id ? { ...i, unit_cost: Number(e.target.value) } : i)))
                    }
                  />
                </div>
                <div className="col-span-2 text-right text-sm">
                  {formatCurrency(item.quantity * item.unit_cost)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button onClick={handleSubmit}>Crear compra</Button>
      </CardContent>
    </Card>
  );
}
