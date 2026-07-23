import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
