import AuthCard from "./AuthCard";
import { Notice } from "./ui";
import type { DbState } from "@/lib/db/health";

/** Shown in place of the dashboard when the database is not ready to serve it. */
export default function DbNotice({ state }: { state: Exclude<DbState, "ok"> }) {
  if (state === "no-binding") {
    return (
      <AuthCard title="No database" subtitle="The dashboard needs the Cloudflare runtime.">
        <Notice tone="warn">
          This server is running without the D1 binding. Start the shop with{" "}
          <code className="rounded bg-black/5 px-1 py-0.5">npm run dev</code>, which runs the app
          the way Cloudflare does.
        </Notice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="The database is empty"
      subtitle="It is connected, but the tables are not there yet."
    >
      <Notice tone="warn">
        Run the migrations, then reload —{" "}
        <code className="inline-block rounded bg-black/5 px-1.5 py-0.5">npm run db:migrate</code>{" "}
        locally, or{" "}
        <code className="inline-block rounded bg-black/5 px-1.5 py-0.5">
          npm run db:migrate:remote
        </code>{" "}
        for the live shop.
      </Notice>
    </AuthCard>
  );
}
