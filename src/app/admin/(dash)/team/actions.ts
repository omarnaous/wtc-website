"use server";

import { revalidatePath } from "next/cache";
import { all, first, run } from "@/lib/db/sql";
import { currentUser, logAudit, type Role } from "@/lib/auth/session";
import { hashToken, newId, newToken } from "@/lib/auth/password";

export interface State {
  error?: string;
  ok?: string;
  /** The join link, shown once so it can be sent to the new person. */
  link?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (!["owner", "admin"].includes(me.role)) {
    return { me, error: "Only an owner or admin can manage the team." as const };
  }
  return { me, error: null };
}

const INVITE_DAYS = 7;

/**
 * Creates an invite rather than an account with a password someone else chose:
 * the new person sets their own, and nobody has to send a password over chat.
 */
export async function inviteMember(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const email = text(data, "email").toLowerCase();
  const role = (text(data, "role") || "staff") as Role;
  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (!["owner", "admin", "staff"].includes(role)) return { error: "Unknown role." };
  if (role === "owner" && me!.role !== "owner") {
    return { error: "Only an owner can invite another owner." };
  }

  const existing = await first<{ id: string }>(`SELECT id FROM admin_users WHERE email = ?`, email);
  if (existing) return { error: "Someone with that email already has an account." };

  const token = newToken();
  const expires = new Date(Date.now() + INVITE_DAYS * 86_400_000);

  await run(`DELETE FROM admin_invites WHERE email = ? AND accepted_at IS NULL`, email);
  await run(
    `INSERT INTO admin_invites (id, email, role, token_hash, invited_by, expires_at)
     VALUES (?,?,?,?,?,?)`,
    newId(),
    email,
    role,
    await hashToken(token),
    me!.id,
    expires.toISOString(),
  );

  await logAudit(me, "create", "invite", email, `Invited ${email} as ${role}.`);
  revalidatePath("/admin/team");
  return {
    ok: `Invite created for ${email}. The link works once, and expires in ${INVITE_DAYS} days.`,
    link: `/admin/join/${token}`,
  };
}

export async function revokeInvite(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };
  await run(`DELETE FROM admin_invites WHERE id = ?`, text(data, "id"));
  await logAudit(me, "delete", "invite", text(data, "id"), "Revoked an invite.");
  revalidatePath("/admin/team");
  return { ok: "Invite revoked." };
}

export async function changeRole(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "id");
  const role = text(data, "role") as Role;
  if (!["owner", "admin", "staff"].includes(role)) return { error: "Unknown role." };

  const target = await first<{ role: Role; name: string }>(
    `SELECT role, name FROM admin_users WHERE id = ?`,
    id,
  );
  if (!target) return { error: "Account not found." };
  if (me!.role !== "owner" && (target.role === "owner" || role === "owner")) {
    return { error: "Only an owner can change an owner." };
  }
  if (id === me!.id && role !== me!.role) {
    return { error: "Change someone else's role, not your own." };
  }
  if (target.role === "owner" && role !== "owner" && (await ownerCount()) <= 1) {
    return { error: "There has to be at least one owner." };
  }

  await run(`UPDATE admin_users SET role = ? WHERE id = ?`, role, id);
  await logAudit(me, "update", "admin_user", id, `Set ${target.name} to ${role}.`);
  revalidatePath("/admin/team");
  return { ok: `${target.name} is now ${role}.` };
}

export async function setStatus(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "id");
  const status = text(data, "status");
  if (!["active", "suspended"].includes(status)) return { error: "Unknown status." };
  if (id === me!.id) return { error: "You cannot suspend yourself." };

  const target = await first<{ role: Role; name: string }>(
    `SELECT role, name FROM admin_users WHERE id = ?`,
    id,
  );
  if (!target) return { error: "Account not found." };
  if (target.role === "owner" && me!.role !== "owner") {
    return { error: "Only an owner can suspend an owner." };
  }
  if (target.role === "owner" && status === "suspended" && (await ownerCount()) <= 1) {
    return { error: "There has to be at least one active owner." };
  }

  await run(`UPDATE admin_users SET status = ? WHERE id = ?`, status, id);
  // Suspending should log them out of every device, not just stop new logins.
  if (status === "suspended") await run(`DELETE FROM admin_sessions WHERE user_id = ?`, id);

  await logAudit(me, "update", "admin_user", id, `${status === "active" ? "Restored" : "Suspended"} ${target.name}.`);
  revalidatePath("/admin/team");
  return { ok: `${target.name} ${status === "active" ? "restored" : "suspended"}.` };
}

export async function removeMember(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "__id");
  if (id === me!.id) return { error: "You cannot remove your own account." };

  const target = await first<{ role: Role; name: string }>(
    `SELECT role, name FROM admin_users WHERE id = ?`,
    id,
  );
  if (!target) return { error: "Account not found." };
  if (target.role === "owner" && me!.role !== "owner") {
    return { error: "Only an owner can remove an owner." };
  }
  if (target.role === "owner" && (await ownerCount()) <= 1) {
    return { error: "There has to be at least one owner." };
  }

  await run(`DELETE FROM admin_users WHERE id = ?`, id);
  await logAudit(me, "delete", "admin_user", id, `Removed ${target.name}.`);
  revalidatePath("/admin/team");
  return { ok: `${target.name} removed.` };
}

async function ownerCount() {
  const row = await first<{ n: number }>(
    `SELECT COUNT(*) AS n FROM admin_users WHERE role = 'owner' AND status = 'active'`,
  );
  return row?.n ?? 0;
}

export async function listSessionsFor(userId: string) {
  return all<{ created_at: string; expires_at: string; user_agent: string | null }>(
    `SELECT created_at, expires_at, user_agent FROM admin_sessions
      WHERE user_id = ? ORDER BY created_at DESC`,
    userId,
  );
}
