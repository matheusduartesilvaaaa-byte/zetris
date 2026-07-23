import { prisma } from "@/lib/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createWithCompany(data: {
    name: string;
    email: string;
    passwordHash: string;
    companyName: string;
    cnpj?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
        },
      });

      const company = await tx.company.create({
        data: {
          name: data.companyName,
          cnpj: data.cnpj || null,
          ownerId: user.id,
          settings: {
            create: {},
          },
        },
      });

      await tx.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: "OWNER",
        },
      });

      return { user, company };
    });
  },

  createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  },

  findValidResetToken(token: string) {
    return prisma.passwordResetToken.findFirst({
      where: { token, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  markResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
