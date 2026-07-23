import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { jobQueue, JobName } from "@/lib/queue";
import { ResendProvider } from "@/lib/email/resend-provider";
import type { SendEmailInput } from "@/lib/email/email-provider.interface";

const provider = new ResendProvider();

interface EmailJobPayload extends SendEmailInput {
  emailLogId: string;
}

/** Chamado pelo worker (registrado em bootstrap) — faz o envio de verdade. */
async function processEmailJob(payload: EmailJobPayload) {
  try {
    await provider.send(payload);
    await prisma.emailLog.update({
      where: { id: payload.emailLogId },
      data: { status: "SENT" },
    });
  } catch (error) {
    logger.error({ err: error, to: payload.to }, "Falha ao enviar e-mail");
    await prisma.emailLog.update({
      where: { id: payload.emailLogId },
      data: { status: "FAILED", error: error instanceof Error ? error.message : "Erro desconhecido" },
    });
  }
}

export const emailService = {
  registerWorker() {
    jobQueue.process<EmailJobPayload>(JobName.SEND_EMAIL, processEmailJob);
  },

  /** Enfileira o envio — nunca bloqueia o fluxo principal (venda, cadastro, etc). */
  async queueEmail(input: SendEmailInput & { companyId?: string; template: string }) {
    const log = await prisma.emailLog.create({
      data: { companyId: input.companyId, to: input.to, template: input.template, status: "QUEUED" },
    });

    await jobQueue.enqueue<EmailJobPayload>(JobName.SEND_EMAIL, {
      to: input.to,
      subject: input.subject,
      html: input.html,
      emailLogId: log.id,
    });
  },
};
