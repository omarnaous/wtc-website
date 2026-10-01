import Link from "next/link";
import BarChart from "@/components/admin/BarChart";
import {
  Card,
  Empty,
  LinkButton,
  PageHeader,
  Pill,
  Stat,
  dateTime,
  money,
} from "@/components/admin/ui";
import { currentUser } from "@/lib/auth/session";
import {
  inventoryValue,
  lowStock,
  previousTotals,
  revenueByDay,
  topSellers,
  totals,
} from "@/lib/store/analytics";
import { listOrders } from "@/lib/store/orders";
import { ORDER_STATUSES } from "@/lib/orders/constants";
import { hasProducts } from "@/lib/store/products";

export const dynamic = "force-dynamic";

const WINDOW = 30;

const toneFor = (status: string) =>
  ORDER_STATUSES.find((s) => s.value === status)?.tone ?? "grey";

function change(now: number, before: number): number | null {
  if (before === 0) return now === 0 ? 0 : null;
  return ((now - before) / before) * 100;
}

export default async function DashboardPage() {
  const me = await currentUser();
  const seeded = await hasProducts();

  if (!seeded) {
    return (
      <>
        <PageHeader
          title={`Welcome, ${me?.name.split(" ")[0] ?? "there"}`}
          subtitle="The shop is connected, and there is nothing in the catalogue yet."
        />
        <Card
          title="Add the first watch"
          description="The catalogue lives here now — there is no file behind the shop to import from."
        >
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-[var(--admin-mute)]">
            <li>· Upload its photographs under Images, then add the watch under Watches.</li>
            <li>· Put it in a collection, and set what you hold under Inventory.</li>
            <li>· Straps are their own list, and each watch says which of them fit it.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <LinkButton href="/admin/products/new" tone="primary">
              Add a watch
            </LinkButton>
            <LinkButton href="/admin/media">Upload images</LinkButton>
          </div>
        </Card>
      </>
    );
  }

  const [now, before, series, recent, top, low, stock] = await Promise.all([
    totals(WINDOW),
    previousTotals(WINDOW),
    revenueByDay(WINDOW),
    listOrders({ limit: 6 }),
    topSellers(WINDOW, "watch", 5),
    lowStock(6),
    inventoryValue(),
  ]);

  return (
    <>
      <PageHeader
        title={`Welcome, ${me?.name.split(" ")[0] ?? "there"}`}
        subtitle={`The last ${WINDOW} days, against the ${WINDOW} before them.`}
        actions={
          <>
            <LinkButton href="/admin/orders/new">Record an order</LinkButton>
            <LinkButton href="/admin/products" tone="primary">
              Manage watches
            </LinkButton>
          </>
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
        <Stat label="Average order" value={money(now.aov)} sub={`${now.units} items sold`} />
        <Stat
          label="Stock on hand"
          value={String(stock.units)}
          sub={`${money(stock.value)} at retail`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Revenue" description={`Daily, last ${WINDOW} days`}>
          <BarChart points={series} />
        </Card>

        <Card
          title="Low stock"
          description="At or under the threshold"
          actions={
            <Link href="/admin/products" className="text-[12.5px] text-[var(--admin-mute)] hover:text-[var(--admin-text)]">
              Inventory →
            </Link>
          }
          bodyClassName="p-2"
        >
          {low.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-[var(--admin-mute)]">
              Nothing is running low.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--admin-line-soft)]">
              {low.map((l) => (
                <li key={`${l.kind}-${l.ref}`} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{l.name}</span>
                    <span className="text-[11.5px] text-[var(--admin-mute)]">
                      {l.kind === "watch" ? "Watch" : "Strap"}
                    </span>
                  </span>
                  <Pill tone={l.on_hand - l.reserved <= 0 ? "red" : "amber"}>
                    {l.on_hand - l.reserved} left
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card
          title="Recent orders"
          actions={
            <Link href="/admin/orders" className="text-[12.5px] text-[var(--admin-mute)] hover:text-[var(--admin-text)]">
              All orders →
            </Link>
          }
          bodyClassName="p-0"
        >
          {recent.orders.length === 0 ? (
            <div className="p-5">
              <Empty title="No orders yet" action={<LinkButton href="/admin/orders/new" tone="primary">Record an order</LinkButton>}>
                Orders placed on the site land here. You can also record one taken over WhatsApp or
                Instagram by hand.
              </Empty>
            </div>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[var(--admin-line-soft)] text-[11.5px] uppercase tracking-[0.06em] text-[var(--admin-mute-2)]">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="hidden px-5 py-2.5 font-medium sm:table-cell">Placed</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-line-soft)]">
                {recent.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[var(--admin-line-soft)]/60">
                    <td className="px-5 py-2.5">
                      <Link href={`/admin/orders/${o.id}`} className="tnum font-medium hover:underline">
                        #{o.number}
                      </Link>
                    </td>
                    <td className="max-w-[160px] truncate px-5 py-2.5">{o.customer_name || "—"}</td>
                    <td className="hidden px-5 py-2.5 text-[var(--admin-mute)] sm:table-cell">
                      {dateTime(o.created_at)}
                    </td>
                    <td className="px-5 py-2.5">
                      <Pill tone={toneFor(o.status)}>{o.status}</Pill>
                    </td>
                    <td className="tnum px-5 py-2.5 text-right font-medium">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Best sellers" description={`By units, last ${WINDOW} days`} bodyClassName="p-2">
          {top.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-[var(--admin-mute)]">
              Nothing sold in this window yet.
            </p>
          ) : (
            <ol className="divide-y divide-[var(--admin-line-soft)]">
              {top.map((t, i) => (
                <li key={t.ref} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="tnum w-4 text-[12px] text-[var(--admin-mute-2)]">{i + 1}</span>
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
      </div>
    </>
  );
}
