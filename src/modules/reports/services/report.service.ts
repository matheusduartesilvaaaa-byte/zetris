import { prisma } from "@/lib/prisma";

export type ReportType = "financial" | "customers" | "products" | "inventory" | "sales";

export interface ReportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export const reportService = {
  async getReportData(companyId: string, type: ReportType): Promise<ReportData> {
    switch (type) {
      case "financial":
        return reportService.getFinancialReport(companyId);
      case "customers":
        return reportService.getCustomersReport(companyId);
      case "products":
        return reportService.getProductsReport(companyId);
      case "inventory":
        return reportService.getInventoryReport(companyId);
      case "sales":
        return reportService.getSalesReport(companyId);
      default:
        throw new Error("Tipo de relatório inválido.");
    }
  },

  async getFinancialReport(companyId: string): Promise<ReportData> {
    const entries = await prisma.cashFlowEntry.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    return {
      title: "Relatório Financeiro - Fluxo de Caixa",
      headers: ["Data", "Descrição", "Tipo", "Categoria", "Valor"],
      rows: entries.map((e) => [
        e.createdAt.toLocaleDateString("pt-BR"),
        e.description,
        e.type === "INCOME" ? "Entrada" : "Saída",
        e.category?.name ?? "—",
        Number(e.amount),
      ]),
    };
  },

  async getCustomersReport(companyId: string): Promise<ReportData> {
    const customers = await prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return {
      title: "Relatório de Clientes",
      headers: ["Nome", "CPF/CNPJ", "Telefone", "E-mail", "Cidade", "Estado"],
      rows: customers.map((c) => [
        c.name,
        c.document ?? "—",
        c.phone ?? "—",
        c.email ?? "—",
        c.city ?? "—",
        c.state ?? "—",
      ]),
    };
  },

  async getProductsReport(companyId: string): Promise<ReportData> {
    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
      include: { category: true },
    });

    return {
      title: "Relatório de Produtos",
      headers: ["Produto", "SKU", "Categoria", "Preço custo", "Preço venda", "Estoque"],
      rows: products.map((p) => [
        p.name,
        p.sku ?? "—",
        p.category?.name ?? "—",
        Number(p.costPrice),
        Number(p.salePrice),
        p.stockQuantity,
      ]),
    };
  },

  async getInventoryReport(companyId: string): Promise<ReportData> {
    const movements = await prisma.stockMovement.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });

    return {
      title: "Relatório de Estoque - Movimentações",
      headers: ["Data", "Produto", "Tipo", "Quantidade", "Motivo"],
      rows: movements.map((m) => [
        m.createdAt.toLocaleDateString("pt-BR"),
        m.product.name,
        m.type,
        m.quantity,
        m.reason ?? "—",
      ]),
    };
  },

  async getSalesReport(companyId: string): Promise<ReportData> {
    const sales = await prisma.sale.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
    });

    return {
      title: "Relatório de Vendas",
      headers: ["Data", "Cliente", "Itens", "Pagamento", "Status", "Total"],
      rows: sales.map((s) => [
        s.createdAt.toLocaleDateString("pt-BR"),
        s.customer?.name ?? "Consumidor final",
        s.items.length,
        s.paymentMethod,
        s.status,
        Number(s.total),
      ]),
    };
  },
};
