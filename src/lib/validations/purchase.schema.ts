import { z } from "zod";

export const purchaseItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  unit_cost: z.coerce.number().min(0.01)
});

export const purchaseSchema = z.object({
  supplier_id: z.string().uuid(),
  received_date: z.string().min(1, "Fecha requerida"),
  invoice_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  payment_status: z.enum(["paid", "pending", "partial"]),
  amount_paid: z.coerce.number().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, "Agrega al menos un producto")
}).refine((data) => {
  if (data.payment_status === "partial") {
    return (data.amount_paid ?? 0) > 0;
  }
  return true;
}, { message: "Monto pagado requerido", path: ["amount_paid"] });

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
