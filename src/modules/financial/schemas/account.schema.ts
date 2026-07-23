import { z } from "zod";

export const accountSchema = z.object({
  description: z.string().min(2, "Informe a descrição"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  dueDate: z.string().min(1, "Informe a data de vencimento"),
  categoryId: z.string().optional().or(z.literal("")),
});

export const accountUpdateSchema = accountSchema.extend({
  id: z.string(),
});

export const financialCategorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria"),
  type: z.enum(["income", "expense"]),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type FinancialCategoryInput = z.infer<typeof financialCategorySchema>;
