/**
 * Camada de domínio pura (sem Prisma, sem Next.js, sem I/O).
 *
 * Isso existe para que a regra de negócio "como uma venda é calculada"
 * possa ser testada com um simples `expect(...).toBe(...)`, sem precisar
 * de banco de dados, e para que possa ser reaproveitada em outros
 * contextos futuramente (ex: simulação de venda na ZIA, cálculo em um
 * orçamento antes de virar venda).
 */

export interface SaleLineInput {
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface SaleTotals<T extends SaleLineInput> {
  items: (T & { total: number })[];
  subtotal: number;
  total: number;
}

export class InvalidSaleError extends Error {}

/**
 * Calcula subtotal, total de cada item e total geral de uma venda.
 * Genérica em `T` para preservar campos extras do chamador (ex: `productId`)
 * sem perder segurança de tipos — a função em si só enxerga e usa os
 * campos de `SaleLineInput`.
 * Lança `InvalidSaleError` se o desconto tornar o total negativo.
 */
export function calculateSaleTotals<T extends SaleLineInput>(items: T[], saleDiscount: number): SaleTotals<T> {
  const resolvedItems = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice - item.discount,
  }));

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - saleDiscount;

  if (total < 0) {
    throw new InvalidSaleError("O desconto não pode ser maior que o valor total da venda.");
  }

  return { items: resolvedItems, subtotal, total };
}

/** Calcula a margem de lucro percentual entre custo e venda. */
export function calculateMargin(costPrice: number, salePrice: number): number | null {
  if (costPrice <= 0) return null;
  return ((salePrice - costPrice) / costPrice) * 100;
}
