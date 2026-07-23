import { registerAuditListener } from "@/lib/events/listeners/audit-listener";
import { registerEmailListener } from "@/lib/events/listeners/email-listener";
import { emailService } from "@/lib/email/email.service";

/**
 * Registra todos os listeners de eventos da plataforma.
 *
 * Ao adicionar um novo efeito colateral no futuro (ex: "enviar e-mail
 * quando conta a receber for paga", ou "gerar insight da ZIA quando venda
 * for concluída"), crie um novo listener em `lib/events/listeners/` e
 * registre-o aqui. Nenhum módulo de negócio precisa ser alterado.
 */
export function registerEventListeners() {
  registerAuditListener();
  registerEmailListener();
  emailService.registerWorker();
}
