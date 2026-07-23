import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths } from "date-fns";
import { getOrSetCache } from "@/lib/cache/memory-cache";
import { analyticsEngineService } from "@/modules/analytics-engine/services/analytics-engine.service";

const METRICS_TTL_MS = 60_000;

export const platformAdminService = {
  async getRevenueMetrics() {
    return getOrSetCache("admin:revenue-metrics", METRICS_TTL_MS, async () => {
      const { mrr, arr, activeCount } = await analyticsEngineService.getMrrArr();

      const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true },
      });
      const revenueByPlan = activeSubscriptions.reduce<Record<string, number>>((acc, sub) => {
        acc[sub.plan.name] = (acc[sub.plan.name] ?? 0) + Number(sub.plan.priceMonthly);
        return acc;
      }, {});

      const totalRevenueAgg = await prisma.invoice.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      });

      return {
        mrr,
        arr,
        revenueByPlan,
        totalRevenue: Number(totalRevenueAgg._sum.amount ?? 0),
        activeSubscriptionsCount: activeCount,
      };
    });
  },

  async getCompanyMetrics() {
    return getOrSetCache("admin:company-metrics", METRICS_TTL_MS, async () => {
      const [total, trialing, active, canceled] = await Promise.all([
        prisma.company.count(),
        prisma.subscription.count({ where: { status: "TRIALING" } }),
        prisma.subscription.count({ where: { status: "ACTIVE" } }),
        prisma.subscription.count({ where: { status: "CANCELED" } }),
      ]);

      const monthStart = startOfMonth(new Date());
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

      const [companiesThisMonth, companiesLastMonth] = await Promise.all([
        prisma.company.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.company.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
      ]);

      const growthRate =
        companiesLastMonth > 0
          ? ((companiesThisMonth - companiesLastMonth) / companiesLastMonth) * 100
          : null;

      const { churnRate } = await analyticsEngineService.getChurnRate();

      return {
        totalCompanies: total,
        trialingCompanies: trialing,
        activeCompanies: active,
        canceledCompanies: canceled,
        companiesThisMonth,
        growthRate,
        churnRate,
      };
    });
  },

  async getUserMetrics() {
    const totalUsers = await prisma.user.count();
    return { totalUsers };
  },

  getUnitEconomics: analyticsEngineService.getLtvAndCac,

  async getAiUsageMetrics() {
    const monthStart = startOfMonth(new Date());
    const [messagesThisMonth, conversationsTotal] = await Promise.all([
      prisma.aiMessage.count({ where: { role: "USER", createdAt: { gte: monthStart } } }),
      prisma.aiConversation.count(),
    ]);
    return { messagesThisMonth, conversationsTotal };
  },

  /**
   * Consumo de armazenamento: ainda não é aplicável — a plataforma não tem
   * um sistema de upload/armazenamento de arquivos implementado (logos e
   * imagens de produto hoje são só URLs externas). Preferimos deixar
   * explícito em vez de inventar um número de "uso de disco".
   */
  async getStorageMetrics() {
    return { available: false, reason: "Sistema de upload de arquivos ainda não implementado." };
  },

  async getSystemHealth() {
    const startedAt = Date.now();
    let databaseOk = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseOk = false;
    }
    return {
      databaseOk,
      databaseLatencyMs: Date.now() - startedAt,
      processUptimeSeconds: Math.floor(process.uptime()),
    };
  },

  async getRecentPayments(limit = 10) {
    return prisma.invoice.findMany({
      where: { status: "paid" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { subscription: { include: { company: true } } },
    });
  },

  async getAuditLogs(limit = 50) {
    return prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { company: { select: { name: true } }, user: { select: { name: true } } },
    });
  },

  async getRecentCompanies(limit = 10) {
    return prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { subscription: { include: { plan: true } } },
    });
  },
};
