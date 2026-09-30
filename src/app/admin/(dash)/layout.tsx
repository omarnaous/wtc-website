import { redirect } from "next/navigation";
import Nav from "@/components/admin/Nav";
import UserMenu from "@/components/admin/UserMenu";
import DbNotice from "@/components/admin/DbNotice";
import { CAPABILITIES, currentUser } from "@/lib/auth/session";
import { dbState } from "@/lib/db/health";
import { tryFirst } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  // Reported here rather than bounced to /admin/login, which could only report
  // the same thing — and bouncing between the two is a redirect loop.
  const state = await dbState();
  if (state !== "ok") return <DbNotice state={state} />;

  const me = await currentUser();
  if (!me) redirect("/admin/login");

  // Counters for the sidebar badges — two cheap aggregates.
  const pending = await tryFirst<{ n: number }>(
    `SELECT COUNT(*) AS n FROM orders WHERE status IN ('pending','confirmed')`,
  );
  const low = await tryFirst<{ n: number }>(
    `SELECT COUNT(*) AS n FROM inventory i JOIN products p ON p.slug = i.product_slug
      WHERE i.track = 1 AND p.status = 'active' AND (i.on_hand - i.reserved) <= i.low_stock_at`,
  );

  return (
    <div className="lg:pl-[236px]">
      <Nav
        role={me.role}
        capabilities={CAPABILITIES[me.role]}
        pendingOrders={pending?.n ?? 0}
        lowStock={low?.n ?? 0}
      />

      <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-3 border-b border-[var(--admin-line)] bg-[var(--admin-bg)]/85 px-4 backdrop-blur sm:px-6">
        <UserMenu name={me.name} email={me.email} />
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
