import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type {
  ProfileInput,
  PasswordChangeInput,
  CompanyInput,
  InviteMemberInput,
} from "@/modules/settings/schemas/settings.schema";

export const settingsService = {
  // ---- Perfil ----
  async updateProfile(userId: string, data: ProfileInput) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    });
    if (existing) throw new Error("Este e-mail já está em uso por outra conta.");

    return prisma.user.update({ where: { id: userId }, data });
  },

  async changePassword(userId: string, data: PasswordChangeInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuário não encontrado.");

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) throw new Error("Senha atual incorreta.");

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  },

  // ---- Empresa ----
  getCompany(companyId: string) {
    return prisma.company.findUnique({ where: { id: companyId } });
  },

  updateCompany(companyId: string, data: CompanyInput) {
    return prisma.company.update({
      where: { id: companyId },
      data: {
        ...data,
        cnpj: data.cnpj || null,
        logoUrl: data.logoUrl || null,
      },
    });
  },

  // ---- Usuários / Membros ----
  listMembers(companyId: string) {
    return prisma.companyMember.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  async inviteMember(companyId: string, data: InviteMemberInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error(
        "Nenhuma conta encontrada com este e-mail. A pessoa precisa se cadastrar na Zetris primeiro."
      );
    }

    const existingMember = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId: user.id } },
    });
    if (existingMember) throw new Error("Este usuário já faz parte da empresa.");

    return prisma.companyMember.create({
      data: { companyId, userId: user.id, role: data.role },
    });
  },

  async updateMemberRole(companyId: string, memberId: string, role: string) {
    const member = await prisma.companyMember.findFirst({ where: { id: memberId, companyId } });
    if (!member) throw new Error("Membro não encontrado.");
    if (member.role === "OWNER") throw new Error("Não é possível alterar o papel do proprietário.");

    return prisma.companyMember.update({
      where: { id: memberId },
      data: { role: role as never },
    });
  },

  async removeMember(companyId: string, memberId: string) {
    const member = await prisma.companyMember.findFirst({ where: { id: memberId, companyId } });
    if (!member) throw new Error("Membro não encontrado.");
    if (member.role === "OWNER") throw new Error("Não é possível remover o proprietário da empresa.");

    await prisma.companyMember.delete({ where: { id: memberId } });
    return { success: true };
  },

  // ---- Preferências (tema, moeda, idioma) ----
  getSettings(companyId: string) {
    return prisma.companySettings.findUnique({ where: { companyId } });
  },

  updateSettings(companyId: string, data: { theme?: string; currency?: string; locale?: string }) {
    return prisma.companySettings.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    });
  },
};
