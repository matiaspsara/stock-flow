"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart, useCartTotals } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/currency";

export type PaymentMethod = "cash" | "debit" | "credit" | "transfer" | "mercadopago" | "account";

export type PaymentData = {
  method: PaymentMethod;
  receivedAmount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
};

export function PaymentModal({
  open,
  onOpenChange,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onConfirm: (data: PaymentData) => void;
}) {
  const { total } = useCartTotals();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [receivedAmount, setReceivedAmount] = useState(total);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const change = useMemo(() => Math.max(receivedAmount - total, 0), [receivedAmount, total]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cobrar venta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <p className="text-sm font-medium">Método de pago</p>
            <RadioGroup value={method} onValueChange={(value) => setMethod(value as PaymentMethod)} className="grid grid-cols-2 gap-3">
              {[
                { value: "cash", label: "Efectivo" },
                { value: "debit", label: "Débito" },
                { value: "credit", label: "Crédito" },
                { value: "transfer", label: "Transferencia" },
                { value: "mercadopago", label: "Mercado Pago" },
                { value: "account", label: "Cuenta corriente" }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 rounded-md border border-border p-3">
                  <RadioGroupItem value={option.value} />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {method === "cash" && (
            <div className="grid gap-3">
              <p className="text-sm font-medium">Efectivo</p>
              <Input
                type="number"
                value={receivedAmount}
                onChange={(event) => setReceivedAmount(Number(event.target.value))}
              />
              <div className="text-sm text-muted-foreground">Vuelto: {formatCurrency(change)}</div>
              <div className="flex gap-2">
                {[0, 500, 1000, 5000].map((extra) => (
                  <Button
                    key={extra}
                    type="button"
                    variant="outline"
                    onClick={() => setReceivedAmount(total + extra)}
                  >
                    {extra === 0 ? "Exacto" : `+${extra}`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {method === "account" && (
            <div className="grid gap-3">
              <Input
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
              />
              <Input
                placeholder="Email del cliente"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
              <Input
                placeholder="Teléfono"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
              <Textarea
                placeholder="Notas"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-600/90"
              onClick={() =>
                onConfirm({
                  method,
                  receivedAmount: method === "cash" ? receivedAmount : undefined,
                  customerName,
                  customerEmail,
                  customerPhone,
                  notes
                })
              }
            >
              Confirmar venta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
