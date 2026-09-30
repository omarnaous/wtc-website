import { redirect } from "next/navigation";
import PasswordForm from "@/components/admin/PasswordForm";
import { Card, PageHeader, Pill, dateTime } from "@/components/admin/ui";
import { CAPABILITIES, currentUser } from "@/lib/auth/session";
import { all } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const me = await currentUser();
  if (!me) redirect("/admin/login");

  const sessions = await all<{ created_at: string; expires_at: string; user_agent: string | null }>(
    `SELECT created_at, expires_at, user_agent FROM admin_sessions
      WHERE user_id = ? ORDER BY created_at DESC`,
    me.id,
  );

  return (
    <>
      <PageHeader title="Your account" subtitle={me.email} />

      <div className="space-y-4">
        <Card title="Access">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="blue">{me.role}</Pill>
            {CAPABILITIES[me.role].map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] text-[var(--admin-mute)]">
            Roles are changed from Team, and not by you on your own account.
          </p>
        </Card>

        <PasswordForm />

        <Card
          title="Signed-in devices"
          description={`${sessions.length} active session${sessions.length === 1 ? "" : "s"}.`}
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-[var(--admin-line-soft)]">
            {sessions.map((s, i) => (
              <li key={i} className="px-5 py-3 text-[13px]">
                <span className="block truncate">{s.user_agent ?? "Unknown device"}</span>
                <span className="mt-0.5 block text-[11.5px] text-[var(--admin-mute)]">
                  since {dateTime(s.created_at)} · expires {dateTime(s.expires_at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
