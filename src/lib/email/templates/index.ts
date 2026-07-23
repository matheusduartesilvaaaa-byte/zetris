interface Template {
  subject: string;
  html: string;
}

const wrapper = (title: string, body: string) => `
  <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h1 style="color: #2563eb; font-size: 20px;">${title}</h1>
    <div style="color: #334155; font-size: 14px; line-height: 1.6;">${body}</div>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Zetris — Gestão empresarial moderna</p>
  </div>
`;

export const emailTemplates = {
  welcome(name: string): Template {
    return {
      subject: "Bem-vindo à Zetris!",
      html: wrapper("Bem-vindo!", `Olá ${name}, sua conta e seu trial de 30 dias já estão ativos.`),
    };
  },

  passwordReset(resetUrl: string): Template {
    return {
      subject: "Redefinição de senha — Zetris",
      html: wrapper(
        "Redefinir senha",
        `Recebemos um pedido para redefinir sua senha. <a href="${resetUrl}">Clique aqui para criar uma nova senha</a>. Se não foi você, ignore este e-mail.`
      ),
    };
  },

  teamInvite(companyName: string, inviteUrl: string): Template {
    return {
      subject: `Você foi convidado para ${companyName} na Zetris`,
      html: wrapper("Convite para equipe", `Você foi convidado a colaborar em ${companyName}. <a href="${inviteUrl}">Aceitar convite</a>.`),
    };
  },

  trialEnding(daysLeft: number): Template {
    return {
      subject: "Seu trial está terminando",
      html: wrapper("Trial acabando", `Faltam ${daysLeft} dia(s) para o fim do seu período de teste. Assine para não perder acesso.`),
    };
  },

  paymentSucceeded(amount: string): Template {
    return {
      subject: "Pagamento confirmado",
      html: wrapper("Pagamento confirmado", `Recebemos seu pagamento de ${amount}. Obrigado por continuar com a Zetris!`),
    };
  },

  paymentFailed(): Template {
    return {
      subject: "Falha no pagamento",
      html: wrapper("Falha no pagamento", `Não conseguimos processar seu pagamento. Atualize os dados do cartão no portal de cobrança.`),
    };
  },

  planChanged(planName: string): Template {
    return {
      subject: "Seu plano foi alterado",
      html: wrapper("Plano alterado", `Sua assinatura agora está no plano ${planName}.`),
    };
  },

  subscriptionCanceled(): Template {
    return {
      subject: "Assinatura cancelada",
      html: wrapper("Assinatura cancelada", `Sua assinatura foi cancelada. Sentiremos sua falta — você pode reativar quando quiser.`),
    };
  },
};
