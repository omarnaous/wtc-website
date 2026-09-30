import "server-only";
import { cookies } from "next/headers";
import { first, run } from "@/lib/db/sql";
import { hashToken, newToken } from "./password";

export const SESSION_COOKIE = "wtc_admin";
const SESSION_DAYS = 30;

export type Role = "owner" | "admin" | "staff";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active" | "suspended";
}

/** What each role is allowed to open. Checked in the layout and per action. */
export const CAPABILITIES = {
  owner: ["orders", "inventory", "products", "straps", "content", "settings", "team", "analytics"],
  admin: ["orders", "inventory", "products", "straps", "content", "settings", "team", "analytics"],
  staff: ["orders", "inventory", "analytics"],
} as const satisfies Record<Role, readonly string[]>;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES][number];

export function can(role: Role, capability: Capability): boolean {
  return (CAPABILITIES[role] as readonly string[]).includes(capability);
}

export async function createSession(userId: string, userAgent?: string) {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await run(
    `INSERT INTO admin_sessions (token_hash, user_id, expires_at, user_agent)
     VALUES (?, ?, ?, ?)`,
    await hashToken(token),
    userId,
    expires.toISOString(),
    userAgent?.slice(0, 255) ?? null,
  );
  await run(`UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?`, userId);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await run(`DELETE FROM admin_sessions WHERE token_hash = ?`, await hashToken(token));
  }
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Never throws — callers decide what to do. */
export async function currentUser(): Promise<AdminUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const row = await first<AdminUser & { expires_at: string }>(
      `SELECT u.id, u.email, u.name, u.role, u.status, s.expires_at
         FROM admin_sessions s
         JOIN admin_users u ON u.id = s.user_id
        WHERE s.token_hash = ?`,
      await hashToken(token),
    );
    if (!row) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) return null;
    if (row.status !== "active") return null;
    return { id: row.id, email: row.email, name: row.name, role: row.role, status: row.status };
  } catch {
    return null;
  }
}

/** True before the first owner exists — unlocks /admin/setup exactly once. */
export async function needsSetup(): Promise<boolean> {
  const row = await first<{ n: number }>(`SELECT COUNT(*) AS n FROM admin_users`);
  return (row?.n ?? 0) === 0;
}

export async function logAudit(
  user: Pick<AdminUser, "id" | "name"> | null,
  action: string,
  entity: string,
  entityId: string | null,
  summary: string,
) {
  try {
    await run(
      `INSERT INTO audit_log (user_id, user_name, action, entity, entity_id, summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      user?.id ?? null,
      user?.name ?? "system",
      action,
      entity,
      entityId,
      summary,
    );
  } catch {
    // An audit write must never be the reason a save fails.
  }
}
