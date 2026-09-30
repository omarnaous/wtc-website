import BarChart from "@/components/admin/BarChart";
import { Card, LinkButton, PageHeader, Stat, cx, money } from "@/components/admin/ui";
import {
  channelBreakdown,
  inventoryValue,
  previousTotals,
  revenueByDay,
  statusBreakdown,
  topSellers,
  totals,
} from "@/lib/store/analytics";

export const dynamic = "force-dynamic";

export const metadata = { title: "Analytics" };

const RANGES = [7, 30, 90, 365];

function change(now: number, before: number): number | null {
  if (before === 0) return now === 0 ? 0 : null;
  return ((now - before) / before) * 100;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;

  const [now, before, series, byStatus, byChannel, topWatches, topStraps, stock] =
    await Promise.all([
      totals(days),
      previousTotals(days),
      revenueByDay(days),
      statusBreakdown(),
      channelBreakdown(days),
      topSellers(days, "watch", 8),
      topSellers(days, "strap", 8),
      inventoryValue(),
    ]);

  const channelTotal = byChannel.reduce((n, c) => n + c.value, 0) || 1;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Everything here comes from the orders. Cancelled and refunded ones are left out."
        actions={
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <LinkButton
                key={r}
                href={`/admin/analytics?days=${r}`}
                tone={r === days ? "primary" : "default"}
                className="!px-3 !py-1.5 !text-[12.5px]"
              >
                {r === 365 ? "1y" : `${r}d`}
              </LinkButton>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Revenue"
          value={money(now.revenue)}
          delta={change(now.revenue, before.revenue)}
          sub={`vs ${money(before.revenue)}`}
        />
        <Stat
          label="Orders"
          value={String(now.orders)}
          delta={change(now.orders, before.orders)}
          sub={`vs ${before.orders}`}
        />
        <Stat label="Average order" value={money(now.aov)} sub={`${now.units} items`} />
        <Stat
          label="Stock at retail"
          value={money(stock.value)}
          sub={`${stock.units} units on hand`}
        />
      </div>

      <div className="mt-4">
        <Card title="Revenue" description={`Daily, last ${days} days`}>
          <BarChart points={series} height={180} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Where orders come from" description={`Last ${days} days`}>
          {byChannel.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[var(--admin-mute)]">
              No orders in this window.
            </p>
          ) : (
            <ul className="space-y-3">
              {byChannel.map((c) => (
                <li key={c.channel}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="capitalize">{c.channel}</span>
                    <span className="tnum text-[var(--admin-mute)]">
                      {c.n} · {money(c.value)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--admin-line-soft)]">
                    <div
                      className="h-full rounded-full bg-zinc-800"
                      style={{ width: `${Math.max(2, (c.value / channelTotal) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Orders by status" description="All time">
          {byStatus.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[var(--admin-mute)]">No orders yet.</p>
          ) : (
            <ul className="space-y-2 text-[13px]">
              {byStatus.map((s) => (
                <li key={s.status} className="flex items-center justify-between">
                  <span className="capitalize">{s.status}</span>
                  <span className="tnum text-[var(--admin-mute)]">
                    {s.n} · {money(s.value)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {[
          { title: "Best-selling watches", rows: topWatches },
          { title: "Best-selling straps", rows: topStraps },
        ].map((block) => (
          <Card key={block.title} title={block.title} description={`Last ${days} days`} bodyClassName="p-2">
            {block.rows.length === 0 ? (
              <p className="px-3 py-8 text-center text-[13px] text-[var(--admin-mute)]">
                Nothing sold in this window.
              </p>
            ) : (
              <ol className="divide-y divide-[var(--admin-line-soft)]">
                {block.rows.map((t, i) => (
                  <li key={t.ref} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="tnum w-4 text-[12px] text-[var(--admin-mute-2)]">{i + 1}</span>
                    <span
                      className={cx(
                        "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-line)]",
                        !t.image && "bg-[var(--admin-line-soft)]",
                      )}
                    >
                      {t.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.image} alt="" className="h-full w-full object-contain p-0.5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px]">{t.name}</span>
                    <span className="tnum text-[12.5px] text-[var(--admin-mute)]">{t.units}×</span>
                    <span className="tnum w-16 text-right text-[12.5px] font-medium">
                      {money(t.revenue)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
