"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { generateReceiptPdf } from "@/lib/utils/generate-receipt-pdf";
import { sendReceipt } from "@/app/actions/send-receipt";
import { toast } from "sonner";

export type ReceiptModalData = {
  saleId: string;
  saleNumber: string;
  createdAt: string;
  storeName: string;
  storeAddress?: string | null;
  taxId?: string | null;
  phone?: string | null;
  sellerName?: string | null;
  items: { name: string; quantity: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerEmail?: string | null;
  receiptFooter?: string | null;
  autoPrint?: boolean;
};

export function ReceiptModal({
  open,
  onOpenChange,
  data
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  data: ReceiptModalData | null;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const resolvedEmail = useMemo(() => data?.customerEmail ?? "", [data?.customerEmail]);

  const handleDownload = () => {
    if (!data) return;
    const pdf = generateReceiptPdf({
      storeName: data.storeName,
      storeAddress: data.storeAddress,
      taxId: data.taxId,
      phone: data.phone,
      saleNumber: data.saleNumber,
      createdAt: data.createdAt,
      sellerName: data.sellerName,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      total: data.total,
      paymentMethod: data.paymentMethod,
      footer: data.receiptFooter
    });
    pdf.save(`recibo-${data.saleNumber}.pdf`);
  };

  const handleEmail = async () => {
    if (!data) return;
    const target = resolvedEmail || email;
    if (!target || !target.includes("@")) {
      toast.error("Email inválido");
      return;
    }
    setSending(true);
    const result = await sendReceipt(data.saleId, target);
    setSending(false);
    if (result.success) {
      toast.success(`Recibo enviado a ${target}`);
    } else {
      toast.error(result.error ?? "Error al enviar recibo");
    }
  };

  useEffect(() => {
    if (open && data?.autoPrint) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
    return;
  }, [open, data?.autoPrint]);

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recibo de venta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md border border-border bg-muted/20 p-4 text-sm">
            <div className="text-center font-semibold">{data.storeName}</div>
            {data.storeAddress && <div className="text-center">{data.storeAddress}</div>}
            {data.taxId && <div className="text-center">CUIT: {data.taxId}</div>}
            <div className="mt-3 text-xs text-muted-foreground">Venta #{data.saleNumber}</div>
            <div className="text-xs text-muted-foreground">{formatDate(data.createdAt, "dd/MM/yyyy HH:mm")}</div>
            <div className="mt-3 space-y-1">
              {data.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>-{formatCurrency(data.discount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>
            {data.receiptFooter && <div className="mt-3 text-center text-xs">{data.receiptFooter}</div>}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Email del cliente"
              value={resolvedEmail || email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={Boolean(resolvedEmail)}
            />
            <Button onClick={handleEmail} disabled={sending}>
              Enviar por email
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Imprimir
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              Descargar PDF
            </Button>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
