import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().optional().nullable(),
  sku: z.string().min(2, "El SKU es obligatorio"),
  barcode: z.string().optional().nullable(),
  category_id: z.string().uuid("Selecciona una categoría"),
  cost_price: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
  selling_price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  current_stock: z.coerce.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  min_stock_threshold: z.coerce.number().int().min(0, "El mínimo debe ser mayor o igual a 0"),
  unit: z.string().min(1, "Ingresa una unidad"),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true)
});

export type ProductFormValues = z.infer<typeof productSchema>;
