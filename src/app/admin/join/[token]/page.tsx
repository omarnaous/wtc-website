import AuthCard from "@/components/admin/AuthCard";
import JoinForm from "@/components/admin/JoinForm";
import { Notice } from "@/components/admin/ui";
import { hashToken } from "@/lib/auth/password";
import { tryFirst } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export const metadata = { title: "Join the dashboard" };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await tryFirst<{ id: string; email: string; role: string; expires_at: string; accepted_at: string | null }>(
    `SELECT id, email, role, expires_at, accepted_at FROM admin_invites WHERE token_hash = ?`,
    [await hashToken(token)],
  );

  const expired = invite && new Date(invite.expires_at).getTime() < Date.now();

  if (!invite || invite.accepted_at || expired) {
    return (
      <AuthCard title="This link will not work">
        <Notice tone="warn">
          {invite?.accepted_at
            ? "That invite has already been used. Ask for a new one, or sign in if the account is yours."
            : expired
              ? "That invite has expired. Ask whoever sent it for a fresh link."
              : "That invite link is not valid. Check it was copied in full."}
        </Notice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Join the dashboard"
      subtitle={`You were invited as ${invite.role}. Choose a password and the account is yours.`}
      footer={invite.email}
    >
      <JoinForm token={token} email={invite.email} />
    </AuthCard>
  );
}
