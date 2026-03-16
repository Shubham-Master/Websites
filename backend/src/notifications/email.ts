import { Resend } from "resend";
import { env } from "../config/env.js";
import type { Session } from "../domain/types.js";

export interface FreeSessionConfirmationEmailInput {
  confirmationCode: string | null | undefined;
  displayName: string;
  session: Session;
  to: string;
}

export interface EmailService {
  sendFreeSessionConfirmation(input: FreeSessionConfirmationEmailInput): Promise<boolean>;
}

function formatSessionDate(session: Session): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: session.timezone
  }).format(new Date(session.startsAt));
}

function buildSubject(session: Session): string {
  return `You're confirmed for ${session.title}`;
}

function buildText(input: FreeSessionConfirmationEmailInput): string {
  const lines = [
    `Hi ${input.displayName},`,
    "",
    `Your free session booking is confirmed for ${input.session.title}.`,
    `When: ${formatSessionDate(input.session)} (${input.session.timezone})`,
    `Language: ${input.session.language}`,
    ""
  ];

  if (input.confirmationCode) {
    lines.push(`Confirmation code: ${input.confirmationCode}`, "");
  }

  lines.push(
    "We will share the private session link closer to the event.",
    "",
    "Warmly,",
    "Unmute"
  );

  return lines.join("\n");
}

function buildHtml(input: FreeSessionConfirmationEmailInput): string {
  const confirmationBlock = input.confirmationCode
    ? `<p style="margin:0 0 16px;"><strong>Confirmation code:</strong> ${input.confirmationCode}</p>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;color:#1f2933;line-height:1.6;">
      <p>Hi ${input.displayName},</p>
      <p>Your free session booking is confirmed for <strong>${input.session.title}</strong>.</p>
      <p style="margin:0 0 16px;">
        <strong>When:</strong> ${formatSessionDate(input.session)} (${input.session.timezone})<br>
        <strong>Language:</strong> ${input.session.language}
      </p>
      ${confirmationBlock}
      <p>We will share the private session link closer to the event.</p>
      <p>Warmly,<br>Unmute</p>
    </div>
  `.trim();
}

class NoopEmailService implements EmailService {
  async sendFreeSessionConfirmation(): Promise<boolean> {
    return false;
  }
}

class ResendEmailService implements EmailService {
  constructor(private readonly client: Resend) {}

  async sendFreeSessionConfirmation(input: FreeSessionConfirmationEmailInput): Promise<boolean> {
    if (!env.EMAIL_FROM) {
      return false;
    }

    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: buildSubject(input.session),
      text: buildText(input),
      html: buildHtml(input),
      replyTo: env.EMAIL_REPLY_TO || undefined
    });

    return true;
  }
}

export function createEmailService(): EmailService {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    return new NoopEmailService();
  }

  return new ResendEmailService(new Resend(env.RESEND_API_KEY));
}
