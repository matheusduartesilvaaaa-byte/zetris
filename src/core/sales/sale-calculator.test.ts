import { describe, it, expect } from "vitest";
import { calculateSaleTotals, calculateMargin, InvalidSaleError } from "@/core/sales/sale-calculator";

describe("calculateSaleTotals", () => {
  it("calcula subtotal e total corretamente para um item simples", () => {
    const result = calculateSaleTotals([{ quantity: 2, unitPrice: 50, discount: 0 }], 0);

    expect(result.subtotal).toBe(100);
    expect(result.total).toBe(100);
    expect(result.items[0].total).toBe(100);
  });

  it("aplica desconto por item e desconto geral da venda", () => {
    const result = calculateSaleTotals(
      [
        { quantity: 1, unitPrice: 100, discount: 10 },
        { quantity: 2, unitPrice: 20, discount: 0 },
      ],
      5
    );

    // subtotal = (1*100) + (2*20) = 140 (desconto por item não afeta subtotal bruto)
    expect(result.subtotal).toBe(140);
    // total = subtotal - desconto geral da venda
    expect(result.total).toBe(135);
    expect(result.items[0].total).toBe(90); // 100 - 10 de desconto no item
  });

  it("lança InvalidSaleError quando o desconto excede o total", () => {
    expect(() => calculateSaleTotals([{ quantity: 1, unitPrice: 10, discount: 0 }], 999)).toThrow(
      InvalidSaleError
    );
  });
});

describe("calculateMargin", () => {
  it("calcula a margem de lucro percentual corretamente", () => {
    expect(calculateMargin(100, 150)).toBe(50);
    expect(calculateMargin(200, 100)).toBe(-50);
  });

  it("retorna null quando o preço de custo é zero ou negativo", () => {
    expect(calculateMargin(0, 100)).toBeNull();
    expect(calculateMargin(-10, 100)).toBeNull();
  });
});
