import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT", "INVENTORY"], {
    errorMap: () => ({ message: "Selecione o tipo de movimentação" }),
  }),
  quantity: z.coerce.number().int().min(0, "Informe uma quantidade válida"),
  reason: z.string().optional().or(z.literal("")),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
