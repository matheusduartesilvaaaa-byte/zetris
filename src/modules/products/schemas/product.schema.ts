import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  costPrice: z.coerce.number().min(0, "Preço de custo inválido"),
  salePrice: z.coerce.number().min(0, "Preço de venda inválido"),
  stockQuantity: z.coerce.number().int().min(0, "Quantidade inválida"),
  minStock: z.coerce.number().int().min(0, "Estoque mínimo inválido"),
});

export const productUpdateSchema = productSchema.extend({
  id: z.string(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
