import { jsPDF } from "jspdf";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";

export type ReceiptPdfData = {
  storeName: string;
  storeAddress?: string | null;
  taxId?: string | null;
  phone?: string | null;
  saleNumber: string;
  createdAt: string;
  sellerName?: string | null;
  items: { name: string; quantity: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  receivedAmount?: number | null;
  change?: number | null;
  footer?: string | null;
};

export function generateReceiptPdf(data: ReceiptPdfData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 40;

  const line = (text: string, size = 11) => {
    doc.setFontSize(size);
    doc.text(text, 40, y);
    y += size + 6;
  };

  line(data.storeName.toUpperCase(), 14);
  if (data.storeAddress) line(data.storeAddress, 10);
  if (data.taxId) line(`CUIT: ${data.taxId}`, 10);
  if (data.phone) line(`Tel: ${data.phone}`, 10);
  line(" ");

  line(`Fecha: ${formatDate(data.createdAt, "dd/MM/yyyy HH:mm")}`, 10);
  line(`Venta N°: ${data.saleNumber}`, 10);
  if (data.sellerName) line(`Vendedor: ${data.sellerName}`, 10);
  line(" ");

  data.items.forEach((item) => {
    line(`${item.name} x${item.quantity} ${formatCurrency(item.subtotal)}`, 10);
  });

  line(" ");
  line(`Subtotal: ${formatCurrency(data.subtotal)}`, 11);
  line(`Descuento: -${formatCurrency(data.discount)}`, 11);
  line(`TOTAL: ${formatCurrency(data.total)}`, 12);
  line(" ");
  line(`Forma de pago: ${data.paymentMethod}`, 10);
  if (data.receivedAmount != null) line(`Recibido: ${formatCurrency(data.receivedAmount)}`, 10);
  if (data.change != null) line(`Vuelto: ${formatCurrency(data.change)}`, 10);

  if (data.footer) {
    line(" ");
    line(data.footer, 10);
  }

  return doc;
}
