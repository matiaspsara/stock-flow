import { z } from "zod";

const cuitRegex = /^\d{2}-\d{8}-\d$/;

export const supplierSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(100),
  contact_person: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().min(6, "Teléfono requerido"),
  address: z.string().optional().nullable(),
  tax_id: z.string().regex(cuitRegex, "Formato CUIT inválido"),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true)
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
