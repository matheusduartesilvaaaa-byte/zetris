import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.coerce.number().int().min(1, "Quantidade inválida"),
  unitPrice: z.coerce.number().min(0, "Preço inválido"),
  discount: z.coerce.number().min(0).default(0),
});

export const saleSchema = z.object({
  customerId: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH", "DEBIT_CARD", "CREDIT_CARD", "PIX", "BANK_TRANSFER", "OTHER"]),
  discount: z.coerce.number().min(0).default(0),
  items: z.array(saleItemSchema).min(1, "Adicione ao menos um produto à venda"),
});

export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
