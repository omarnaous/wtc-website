import { brevoKey } from "@/lib/db/binding";

/**
 * Transactional email through Brevo (api.brevo.com/v3/smtp/email).
 *
 * Plain fetch, no SDK — it is one endpoint, and the SDK drags Node built-ins
 * into a Worker for nothing.
 */

export interface Mail {
  from: { name: string; email: string };
  to: { email: string; name?: string }[];
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  /** Brevo tags, for filtering the transactional log in their dashboard. */
  tags?: string[];
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendMail(mail: Mail): Promise<SendResult> {
  const key = await brevoKey();
  if (!key) return { ok: false, error: "BREVO_API_KEY is not set on this environment" };
  if (!mail.from.email) return { ok: false, error: "no sender address configured" };
  if (!mail.to.length) return { ok: false, error: "no recipients" };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: mail.from,
        to: mail.to,
        replyTo: mail.replyTo,
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
        tags: mail.tags,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { messageId?: string; message?: string; code?: string };
    if (!res.ok) return { ok: false, error: `Brevo ${res.status}: ${body.message ?? body.code ?? "no detail"}` };
    return { ok: true, id: body.messageId ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "request failed" };
  }
}
