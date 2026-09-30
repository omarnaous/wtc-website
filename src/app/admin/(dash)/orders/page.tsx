import Link from "next/link";
import Filters from "@/components/admin/Filters";
import { Card, Empty, LinkButton, PageHeader, Pill, dateTime, money } from "@/components/admin/ui";
import { listOrders } from "@/lib/store/orders";
import { CHANNELS, ORDER_STATUSES } from "@/lib/orders/constants";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders" };

const PER_PAGE = 50;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const { orders, total } = await listOrders({
    status: sp.status,
    channel: sp.channel,
    q: sp.q,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const tone = (s: string) => ORDER_STATUSES.find((o) => o.value === s)?.tone ?? "grey";

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${total} order${total === 1 ? "" : "s"}`}
        actions={
          <LinkButton href="/admin/orders/new" tone="primary">
            Record an order
          </LinkButton>
        }
      />

      <Filters
        search={{ name: "q", placeholder: "Search name, phone or order number…" }}
        selects={[
          {
            name: "status",
            label: "Status",
            options: [
              { value: "all", label: "Any status" },
              ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            ],
          },
          {
            name: "channel",
            label: "Channel",
            options: [
              { value: "all", label: "Any channel" },
              ...CHANNELS.map((c) => ({ value: c, label: c })),
            ],
          },
        ]}
      />

      <Card bodyClassName="p-0">
        {orders.length === 0 ? (
          <div className="p-5">
            <Empty
              title="No orders here"
              action={
                <LinkButton href="/admin/orders/new" tone="primary">
                  Record an order
                </LinkButton>
              }
            >
              Orders placed on the site arrive here on their own. Anything sold over WhatsApp,
              Instagram or across the counter can be recorded by hand so the stock and the figures
              stay right.
            </Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="border-b border-[var(--admin-line-soft)] text-[11.5px] uppercase tracking-[0.06em] text-[var(--admin-mute-2)]">
                <tr>
                  <th className="py-2.5 pl-5 pr-3 font-medium">Order</th>
                  <th className="px-3 py-2.5 font-medium">Customer</th>
                  <th className="px-3 py-2.5 font-medium">Placed</th>
                  <th className="px-3 py-2.5 font-medium">Channel</th>
                  <th className="px-3 py-2.5 font-medium">Payment</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 text-right font-medium">Items</th>
                  <th className="py-2.5 pl-3 pr-5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-line-soft)]">
                {orders.map((o) => (
                  <tr key={o.id} className="group hover:bg-[var(--admin-line-soft)]/60">
                    <td className="py-2.5 pl-5 pr-3">
                      <Link href={`/admin/orders/${o.id}`} className="tnum font-medium group-hover:underline">
                        #{o.number}
                      </Link>
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-2.5">
                      {o.customer_name || "—"}
                      <span className="tnum block text-[11.5px] text-[var(--admin-mute)]">
                        {o.phone}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--admin-mute)]">{dateTime(o.created_at)}</td>
                    <td className="px-3 py-2.5 capitalize text-[var(--admin-mute)]">{o.channel}</td>
                    <td className="px-3 py-2.5">
                      <Pill tone={o.payment_status === "paid" ? "green" : o.payment_status === "refunded" ? "red" : "grey"}>
                        {o.payment_status}
                      </Pill>
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill tone={tone(o.status)}>{o.status}</Pill>
                    </td>
                    <td className="tnum px-3 py-2.5 text-right text-[var(--admin-mute)]">{o.items}</td>
                    <td className="tnum py-2.5 pl-3 pr-5 text-right font-medium">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-[13px]">
          <span className="text-[var(--admin-mute)]">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && <LinkButton href={`/admin/orders?page=${page - 1}`}>Previous</LinkButton>}
            {page < pages && <LinkButton href={`/admin/orders?page=${page + 1}`}>Next</LinkButton>}
          </div>
        </div>
      )}
    </>
  );
}
