import type { IEmailProvider, SendEmailInput } from "@/lib/email/email-provider.interface";

const FROM_ADDRESS = process.env.EMAIL_FROM || "Zetris <noreply@zetris.com>";

export class ResendProvider implements IEmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não configurada.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend retornou ${response.status}: ${body}`);
    }
  }
}
