"use server";

import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/session-guard";
import { prisma } from "@/lib/prisma";
import { settingsService } from "@/modules/settings/services/settings.service";
import {
  profileSchema,
  passwordChangeSchema,
  companySchema,
  inviteMemberSchema,
} from "@/modules/settings/schemas/settings.schema";

export type ActionResult = { success: boolean; message?: string };

export async function getProfileAction() {
  const { userId } = await requireActiveCompany();
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });
}

export async function updateProfileAction(formData: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { userId } = await requireActiveCompany();
  try {
    await settingsService.updateProfile(userId, parsed.data);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao atualizar perfil" };
  }
}

export async function changePasswordAction(formData: unknown): Promise<ActionResult> {
  const parsed = passwordChangeSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { userId } = await requireActiveCompany();
  try {
    await settingsService.changePassword(userId, parsed.data);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao alterar senha" };
  }
}

export async function getCompanyAction() {
  const { companyId } = await requireActiveCompany();
  return settingsService.getCompany(companyId);
}

export async function updateCompanyAction(formData: unknown): Promise<ActionResult> {
  const parsed = companySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId, role } = await requireActiveCompany();
  if (role === "STAFF") {
    return { success: false, message: "Você não tem permissão para editar a empresa." };
  }

  try {
    await settingsService.updateCompany(companyId, parsed.data);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao atualizar empresa" };
  }
}

export async function listMembersAction() {
  const { companyId } = await requireActiveCompany();
  return settingsService.listMembers(companyId);
}

export async function inviteMemberAction(formData: unknown): Promise<ActionResult> {
  const parsed = inviteMemberSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  const { companyId, role } = await requireActiveCompany();
  if (role === "STAFF" || role === "MANAGER") {
    return { success: false, message: "Você não tem permissão para convidar usuários." };
  }

  try {
    await settingsService.inviteMember(companyId, parsed.data);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao convidar usuário" };
  }
}

export async function removeMemberAction(memberId: string): Promise<ActionResult> {
  const { companyId, role } = await requireActiveCompany();
  if (role === "STAFF" || role === "MANAGER") {
    return { success: false, message: "Você não tem permissão para remover usuários." };
  }

  try {
    await settingsService.removeMember(companyId, memberId);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Erro ao remover usuário" };
  }
}
