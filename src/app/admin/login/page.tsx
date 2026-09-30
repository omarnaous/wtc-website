import { redirect } from "next/navigation";
import AuthCard from "@/components/admin/AuthCard";
import DbNotice from "@/components/admin/DbNotice";
import LoginForm from "@/components/admin/LoginForm";
import { currentUser, needsSetup } from "@/lib/auth/session";
import { dbState } from "@/lib/db/health";

// Literal rather than re-exported: vinext classifies routes by static
// analysis, and an indirect value reads as "unknown".
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const state = await dbState();
  if (state !== "ok") return <DbNotice state={state} />;
  if (await needsSetup()) redirect("/admin/setup");
  if (await currentUser()) redirect("/admin");

  return (
    <AuthCard title="Sign in" subtitle="Manage the catalogue, orders and every word on the site.">
      <LoginForm />
    </AuthCard>
  );
}
