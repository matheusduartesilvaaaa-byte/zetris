"use server";

import { registerSchema } from "@/modules/auth/schemas/register.schema";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/modules/auth/schemas/password-reset.schema";
import { authService } from "@/modules/auth/services/auth.service";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type ActionResult = { success: boolean; message?: string };

export async function registerAction(formData: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  try {
    await authService.register(parsed.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao criar conta",
    };
  }
}

export async function loginAction(formData: unknown): Promise<ActionResult> {
  const parsed = formData as { email: string; password: string; callbackUrl?: string };

  try {
    await signIn("credentials", {
      email: parsed.email,
      password: parsed.password,
      redirectTo: parsed.callbackUrl || "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: "E-mail ou senha inválidos" };
    }
    throw error;
  }
}

export async function forgotPasswordAction(formData: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  await authService.requestPasswordReset(parsed.data.email);
  return { success: true, message: "Se o e-mail existir, enviamos um link de recuperação." };
}

export async function resetPasswordAction(formData: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message ?? "Dados inválidos" };
  }

  try {
    await authService.resetPassword(parsed.data.token, parsed.data.password);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao redefinir senha",
    };
  }
}
