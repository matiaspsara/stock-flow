import { z } from "zod";

export const adjustmentSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  adjustment_type: z.enum(["increase", "decrease"]),
  reason: z.enum([
    "damaged",
    "theft",
    "count",
    "found",
    "expired",
    "other"
  ]),
  notes: z.string().optional().nullable()
}).refine((data) => {
  if (data.reason === "other") return (data.notes ?? "").trim().length > 2;
  return true;
}, { message: "Notas requeridas", path: ["notes"] });

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;
