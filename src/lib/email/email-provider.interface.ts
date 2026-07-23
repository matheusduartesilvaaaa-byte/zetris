export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  send(input: SendEmailInput): Promise<void>;
}
