"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { generateReceiptPdf } from "@/lib/utils/generate-receipt-pdf";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceipt(saleId: string, recipientEmail: string) {
  if (!saleId || !recipientEmail) {
    return { success: false, error: "Datos inválidos" };
  }

  const supabase = createClient();

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("*, users(full_name)")
    .eq("id", saleId)
    .single();

  if (saleError || !sale) {
    return { success: false, error: saleError?.message ?? "Venta no encontrada" };
  }

  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select("product_name, quantity, subtotal")
    .eq("sale_id", saleId);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  const { data: settings } = await supabase
    .from("organization_settings")
    .select(
      "store_name, store_address, tax_id, phone, email, receipt_footer, receipt_from_email, receipt_email_footer, cc_owner_on_receipt"
    )
    .eq("organization_id", sale.organization_id)
    .single();

  let pdfBase64: string | null = null;
  try {
    const pdf = generateReceiptPdf({
      storeName: settings?.store_name ?? "StockFlow",
      storeAddress: settings?.store_address,
      taxId: settings?.tax_id,
      phone: settings?.phone,
      saleNumber: sale.sale_number,
      createdAt: sale.created_at,
      sellerName: sale.users?.full_name ?? null,
      items: (items ?? []).map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        subtotal: Number(item.subtotal)
      })),
      subtotal: Number(sale.total_amount),
      discount: Number(sale.discount_amount),
      total: Number(sale.final_amount),
      paymentMethod: sale.payment_method,
      footer: settings?.receipt_email_footer ?? settings?.receipt_footer
    });
    const pdfArray = pdf.output("arraybuffer");
    pdfBase64 = Buffer.from(pdfArray).toString("base64");
  } catch (err) {
    pdfBase64 = null;
  }

  const subject = `Recibo de Compra - ${settings?.store_name ?? "StockFlow"} - Venta #${sale.sale_number}`;
  const html = `
    <p>Gracias por tu compra.</p>
    <p><strong>Venta:</strong> ${sale.sale_number}</p>
    <p><strong>Total:</strong> ${sale.final_amount}</p>
    <p>${settings?.receipt_email_footer ?? ""}</p>
  `;

  const fromEmail =
    settings?.receipt_from_email ??
    process.env.RESEND_FROM_EMAIL ??
    "StockFlow <onboarding@resend.dev>";

  const cc = settings?.cc_owner_on_receipt && settings?.email ? [settings.email] : undefined;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: recipientEmail,
    cc,
    subject,
    html,
    attachments: pdfBase64
      ? [
          {
            filename: `recibo-${sale.sale_number}.pdf`,
            content: pdfBase64
          }
        ]
      : undefined
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
