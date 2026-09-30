"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { first, run } from "@/lib/db/sql";
import { hashPassword, hashToken, newId, passwordProblem } from "@/lib/auth/password";
import { createSession, logAudit } from "@/lib/auth/session";

export interface JoinState {
  error?: string;
}

/** Turns a valid invite into an account. The invite is spent either way. */
export async function acceptInvite(_prev: JoinState, data: FormData): Promise<JoinState> {
  const token = String(data.get("token") ?? "");
  const name = String(data.get("name") ?? "").trim();
  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirm") ?? "");

  if (!name) return { error: "Enter your name." };
  if (password !== confirm) return { error: "The two passwords do not match." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const invite = await first<{ id: string; email: string; role: string; expires_at: string; accepted_at: string | null }>(
    `SELECT id, email, role, expires_at, accepted_at FROM admin_invites WHERE token_hash = ?`,
    await hashToken(token),
  );
  if (!invite || invite.accepted_at) return { error: "That invite is no longer valid." };
  if (new Date(invite.expires_at).getTime() < Date.now()) return { error: "That invite has expired." };

  const taken = await first<{ id: string }>(
    `SELECT id FROM admin_users WHERE email = ?`,
    invite.email,
  );
  if (taken) return { error: "An account with that email already exists. Sign in instead." };

  const { hash, salt, iterations } = await hashPassword(password);
  const id = newId();
  await run(
    `INSERT INTO admin_users (id, email, name, password_hash, password_salt, password_iter, role)
     VALUES (?,?,?,?,?,?,?)`,
    id,
    invite.email,
    name,
    hash,
    salt,
    iterations,
    invite.role,
  );
  await run(`UPDATE admin_invites SET accepted_at = datetime('now') WHERE id = ?`, invite.id);

  await logAudit({ id, name }, "create", "admin_user", id, `${name} accepted their invite.`);
  await createSession(id, (await headers()).get("user-agent") ?? undefined);
  redirect("/admin");
}
