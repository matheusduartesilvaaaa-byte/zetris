import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository } from "@/modules/auth/repository/user.repository";
import type { RegisterInput } from "@/modules/auth/schemas/register.schema";
import { billingService } from "@/modules/billing/services/billing.service";
import { logger } from "@/lib/logger";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type AuthEventPayload } from "@/lib/events/domain-events";

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MINUTES = 60;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("Já existe uma conta com este e-mail.");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const result = await userRepository.createWithCompany({
      name: input.name,
      email: input.email,
      passwordHash,
      companyName: input.companyName,
      cnpj: input.cnpj,
    });

    // Toda empresa nasce com 30 dias de trial no plano Core, sem cartão.
    // Isolado em try/catch: um problema no billing nunca deve impedir o
    // cadastro do usuário — fica registrado no log para correção manual.
    try {
      await billingService.startTrialForCompany(result.company.id);
    } catch (error) {
      logger.error({ err: error, companyId: result.company.id }, "Falha ao iniciar trial da empresa");
    }

    eventBus.emit<AuthEventPayload>(DomainEvent.AUTH_USER_REGISTERED, {
      companyId: result.company.id,
      userId: result.user.id,
      entityType: "User",
      entityId: result.user.id,
      metadata: { email: result.user.email },
    });

    return result;
  },

  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);
    // Não revelamos se o e-mail existe ou não (evita enumeração de contas)
    if (!user) return { sent: true };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await userRepository.createPasswordResetToken(user.id, token, expiresAt);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    eventBus.emit<AuthEventPayload>(DomainEvent.AUTH_PASSWORD_RESET_REQUESTED, {
      userId: user.id,
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email, resetUrl },
    });

    return { sent: true, token };
  },

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await userRepository.findValidResetToken(token);
    if (!resetToken) {
      throw new Error("Token inválido ou expirado.");
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(resetToken.userId, passwordHash);
    await userRepository.markResetTokenUsed(resetToken.id);

    return { success: true };
  },
};
