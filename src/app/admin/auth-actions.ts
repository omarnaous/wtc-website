"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { first, run } from "@/lib/db/sql";
import { setupToken } from "@/lib/db/binding";
import { hashPassword, newId, passwordProblem, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  currentUser,
  destroySession,
  logAudit,
  needsSetup,
} from "@/lib/auth/session";

export interface FormState {
  error?: string;
  ok?: string;
}

const email = (v: FormDataEntryValue | null) => String(v ?? "").trim().toLowerCase();
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function signIn(_prev: FormState, data: FormData): Promise<FormState> {
  const address = email(data.get("email"));
  const password = String(data.get("password") ?? "");
  if (!address || !password) return { error: "Enter your email and password." };

  const user = await first<{
    id: string;
    password_hash: string;
    password_salt: string;
    password_iter: number;
    status: string;
  }>(
    `SELECT id, password_hash, password_salt, password_iter, status
       FROM admin_users WHERE email = ?`,
    address,
  );

  // Same message either way: a different one for "no such account" tells an
  // attacker which addresses are worth guessing at.
  const wrong = { error: "That email and password do not match." };
  if (!user) return wrong;

  const valid = await verifyPassword(password, {
    hash: user.password_hash,
    salt: user.password_salt,
    iterations: user.password_iter,
  });
  if (!valid) return wrong;
  if (user.status !== "active") return { error: "That account has been suspended." };

  const agent = (await headers()).get("user-agent") ?? undefined;
  await createSession(user.id, agent);
  redirect("/admin");
}

export async function signOut() {
  await destroySession();
  redirect("/admin/login");
}

/** Creates the first owner. Refuses once any account exists. */
export async function createFirstOwner(_prev: FormState, data: FormData): Promise<FormState> {
  if (!(await needsSetup())) return { error: "This shop already has an account. Sign in instead." };

  // The page checks this too, but a server action can be called without it.
  const expected = await setupToken();
  if (expected && String(data.get("token") ?? "") !== expected) {
    return { error: "This setup link is not valid." };
  }

  const name = text(data.get("name"));
  const address = email(data.get("email"));
  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirm") ?? "");

  if (!name) return { error: "Enter your name." };
  if (!address.includes("@")) return { error: "Enter a valid email address." };
  if (password !== confirm) return { error: "The two passwords do not match." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const { hash, salt, iterations } = await hashPassword(password);
  const id = newId();
  await run(
    `INSERT INTO admin_users (id, email, name, password_hash, password_salt, password_iter, role)
     VALUES (?,?,?,?,?,?, 'owner')`,
    id,
    address,
    name,
    hash,
    salt,
    iterations,
  );
  await logAudit({ id, name }, "create", "admin_user", id, `Owner account created for ${address}.`);
  await createSession(id, (await headers()).get("user-agent") ?? undefined);
  redirect("/admin");
}

export async function changeOwnPassword(_prev: FormState, data: FormData): Promise<FormState> {
  const me = await currentUser();
  if (!me) return { error: "Session expired. Sign in again." };

  const currentPassword = String(data.get("current") ?? "");
  const next = String(data.get("password") ?? "");
  const confirm = String(data.get("confirm") ?? "");

  const row = await first<{ password_hash: string; password_salt: string; password_iter: number }>(
    `SELECT password_hash, password_salt, password_iter FROM admin_users WHERE id = ?`,
    me.id,
  );
  if (!row) return { error: "Account not found." };

  const valid = await verifyPassword(currentPassword, {
    hash: row.password_hash,
    salt: row.password_salt,
    iterations: row.password_iter,
  });
  if (!valid) return { error: "Your current password is not right." };
  if (next !== confirm) return { error: "The two new passwords do not match." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  const { hash, salt, iterations } = await hashPassword(next);
  await run(
    `UPDATE admin_users SET password_hash = ?, password_salt = ?, password_iter = ? WHERE id = ?`,
    hash,
    salt,
    iterations,
    me.id,
  );
  // Every other session for this account is now stale.
  await run(`DELETE FROM admin_sessions WHERE user_id = ?`, me.id);
  await createSession(me.id, (await headers()).get("user-agent") ?? undefined);
  await logAudit(me, "update", "admin_user", me.id, "Changed their own password.");
  return { ok: "Password changed." };
}
