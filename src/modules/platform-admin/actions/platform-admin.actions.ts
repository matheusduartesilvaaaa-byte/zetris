"use server";

import { requirePlatformAdmin } from "@/lib/admin-guard";
import { platformAdminService } from "@/modules/platform-admin/services/platform-admin.service";

export async function getPlatformOverviewAction() {
  await requirePlatformAdmin();

  const [revenue, companies, users, unitEconomics, recentCompanies, aiUsage, storage, systemHealth, recentPayments, auditLogs] =
    await Promise.all([
      platformAdminService.getRevenueMetrics(),
      platformAdminService.getCompanyMetrics(),
      platformAdminService.getUserMetrics(),
      platformAdminService.getUnitEconomics(),
      platformAdminService.getRecentCompanies(),
      platformAdminService.getAiUsageMetrics(),
      platformAdminService.getStorageMetrics(),
      platformAdminService.getSystemHealth(),
      platformAdminService.getRecentPayments(),
      platformAdminService.getAuditLogs(),
    ]);

  return {
    revenue,
    companies,
    users,
    unitEconomics,
    recentCompanies,
    aiUsage,
    storage,
    systemHealth,
    recentPayments,
    auditLogs,
  };
}
