"use client";

import { jsPDF } from "jspdf";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";

export type ReceiptItem = {
  name: string;
  quantity: number;
  subtotal: number;
};

export function ReceiptPreview({
  saleNumber,
  items,
  subtotal,
  discount,
  total,
  paymentMethod,
  receivedAmount,
  change
}: {
  saleNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  receivedAmount?: number;
  change?: number;
}) {
  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 10;
    const line = (text: string) => {
      doc.text(text, 10, y);
      y += 6;
    };

    line("LIBRERÍA PAPELITO");
    line("Av. Corrientes 1234, Buenos Aires");
    line("CUIT: 20-12345678-9");
    line(" ");
    line(`Fecha: ${formatDate(new Date(), "dd/MM/yyyy HH:mm")}`);
    line(`Venta N°: ${saleNumber}`);
    line(" ");

    items.forEach((item) => {
      line(`${item.name} x${item.quantity} - ${formatCurrency(item.subtotal)}`);
    });

    line(" ");
    line(`Subtotal: ${formatCurrency(subtotal)}`);
    line(`Descuento: -${formatCurrency(discount)}`);
    line(`TOTAL: ${formatCurrency(total)}`);
    line(" ");
    line(`Pago: ${paymentMethod}`);
    if (receivedAmount !== undefined) {
      line(`Recibido: ${formatCurrency(receivedAmount)}`);
      line(`Vuelto: ${formatCurrency(change ?? 0)}`);
    }

    doc.save(`recibo-${saleNumber}.pdf`);
  };

  return (
    <div className="grid gap-2">
      <Button onClick={handleDownload} variant="outline">
        Descargar PDF
      </Button>
    </div>
  );
}
