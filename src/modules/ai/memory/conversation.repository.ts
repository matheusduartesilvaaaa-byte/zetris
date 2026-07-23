import { prisma } from "@/lib/prisma";

const MAX_HISTORY_MESSAGES = 20;

export const conversationRepository = {
  async findOrCreateActive(companyId: string, userId: string) {
    const existing = await prisma.aiConversation.findFirst({
      where: { companyId, userId },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) return existing;

    return prisma.aiConversation.create({ data: { companyId, userId } });
  },

  async getHistory(conversationId: string) {
    return prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: MAX_HISTORY_MESSAGES,
    });
  },

  async appendMessage(
    conversationId: string,
    role: "USER" | "ASSISTANT",
    content: string,
    tokensUsed?: number
  ) {
    await prisma.aiMessage.create({
      data: { conversationId, role, content, tokensUsed },
    });
    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  },

  /** Usado para limitar mensagens/mês conforme o plano (ver usage-limit.service.ts). */
  countMessagesThisMonth(companyId: string, monthStart: Date) {
    return prisma.aiMessage.count({
      where: {
        role: "USER",
        conversation: { companyId },
        createdAt: { gte: monthStart },
      },
    });
  },
};
