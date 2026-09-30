import { redirect } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import DbNotice from "@/components/admin/DbNotice";
import SetupForm from "@/components/admin/SetupForm";
import { Notice } from "@/components/admin/ui";
import { needsSetup } from "@/lib/auth/session";
import { setupToken } from "@/lib/db/binding";
import { dbState } from "@/lib/db/health";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const state = await dbState();
  if (state !== "ok") return <DbNotice state={state} />;
  // Once an owner exists this page is closed for good.
  if (!(await needsSetup())) redirect("/admin/login");

  // On a public URL this page hands over the shop, so it is held behind a
  // secret when one is set. See setupToken().
  const expected = await setupToken();
  const { token } = await searchParams;
  if (expected && token !== expected) {
    return (
      <AuthCard title="Setup is locked">
        <Notice tone="warn">
          This shop has no owner yet, and the setup link is held behind a token. Open{" "}
          <code className="rounded bg-black/5 px-1 py-0.5">/admin/setup?token=…</code> with the
          value of the <code className="rounded bg-black/5 px-1 py-0.5">SETUP_TOKEN</code> secret.
        </Notice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set up the dashboard"
      subtitle="This is the first account, so it owns the shop. You can invite the rest of the team afterwards."
      footer="Only shown once — after this, the page redirects to sign in."
    >
      <SetupForm token={token} />
    </AuthCard>
  );
}
