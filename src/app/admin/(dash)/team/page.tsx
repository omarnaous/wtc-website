import { redirect } from "next/navigation";
import TeamManager, { type Invite, type Member } from "@/components/admin/TeamManager";
import { Card, PageHeader, dateTime } from "@/components/admin/ui";
import { currentUser } from "@/lib/auth/session";
import { all, tryAll } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const me = await currentUser();
  if (!me) redirect("/admin/login");
  if (me.role === "staff") redirect("/admin");

  const [members, invites, audit] = await Promise.all([
    all<Member>(
      `SELECT id, email, name, role, status, created_at, last_login_at
         FROM admin_users ORDER BY created_at`,
    ),
    all<Invite>(
      `SELECT id, email, role, created_at, expires_at FROM admin_invites
        WHERE accepted_at IS NULL AND expires_at > datetime('now')
        ORDER BY created_at DESC`,
    ),
    tryAll<{ id: number; user_name: string | null; summary: string; created_at: string }>(
      `SELECT id, user_name, summary, created_at FROM audit_log
        ORDER BY created_at DESC, id DESC LIMIT 40`,
    ),
  ]);

  return (
    <>
      <PageHeader title="Team" subtitle="Who can sign in, and what each of them can reach." />

      <TeamManager members={members} invites={invites} me={{ id: me.id, role: me.role }} />

      <div className="mt-4">
        <Card
          title="Recent activity"
          description="Every change made from this dashboard, and who made it."
          bodyClassName="p-0"
        >
          {audit.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[var(--admin-mute)]">
              Nothing logged yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--admin-line-soft)]">
              {audit.map((a) => (
                <li key={a.id} className="flex flex-wrap gap-x-3 px-5 py-2.5 text-[13px]">
                  <span className="min-w-0 flex-1">{a.summary}</span>
                  <span className="text-[11.5px] text-[var(--admin-mute)]">
                    {a.user_name ?? "system"} · {dateTime(a.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
