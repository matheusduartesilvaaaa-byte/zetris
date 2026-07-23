import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Informe o nome do fornecedor"),
  document: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
