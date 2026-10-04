import { notFound } from "next/navigation";
import DangerZone from "@/components/admin/DangerZone";
import OrderControls from "@/components/admin/OrderControls";
import { Card, PageHeader, Pill, dateTime, money } from "@/components/admin/ui";
import { currentUser } from "@/lib/auth/session";
import { getOrder } from "@/lib/store/orders";
import { ORDER_STATUSES } from "@/lib/orders/constants";
import { removeOrder } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getOrder(id);
  return { title: found ? `Order #${found.order.number}` : "Order" };
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getOrder(id);
  if (!found) notFound();

  const { order, items, events } = found;
  const me = await currentUser();
  const tone = ORDER_STATUSES.find((s) => s.value === order.status)?.tone ?? "grey";

  const address = [order.address_line, order.area, order.city, order.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageHeader
        title={`Order #${order.number}`}
        subtitle={`Placed ${dateTime(order.created_at)} · ${order.channel}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={<Pill tone={tone}>{order.status}</Pill>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-4">
          <Card title="Items" bodyClassName="p-0">
            <table className="w-full text-left text-[13px]">
              <tbody className="divide-y divide-[var(--admin-line-soft)]">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--admin-line)] bg-[var(--admin-line-soft)]">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="h-full w-full object-contain p-1" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{item.name}</span>
                          <span className="block truncate text-[11.5px] text-[var(--admin-mute)]">
                            {item.kind} · {item.ref}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="tnum px-3 py-3 text-right text-[var(--admin-mute)]">
                      {money(item.unit_price)} × {item.qty}
                    </td>
                    <td className="tnum py-3 pl-3 pr-5 text-right font-medium">
                      {money(item.unit_price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[var(--admin-line-soft)] text-[13px]">
                <tr>
                  <td className="py-2 pl-5 pr-3 text-[var(--admin-mute)]" colSpan={2}>
                    Subtotal
                  </td>
                  <td className="tnum py-2 pl-3 pr-5 text-right">{money(order.subtotal)}</td>
                </tr>
                {order.shipping > 0 && (
                  <tr>
                    <td className="py-1 pl-5 pr-3 text-[var(--admin-mute)]" colSpan={2}>
                      Delivery
                    </td>
                    <td className="tnum py-1 pl-3 pr-5 text-right">{money(order.shipping)}</td>
                  </tr>
                )}
                {order.discount > 0 && (
                  <tr>
                    <td className="py-1 pl-5 pr-3 text-[var(--admin-mute)]" colSpan={2}>
                      Discount
                    </td>
                    <td className="tnum py-1 pl-3 pr-5 text-right">−{money(order.discount)}</td>
                  </tr>
                )}
                <tr className="font-semibold">
                  <td className="py-2.5 pl-5 pr-3" colSpan={2}>
                    Total
                  </td>
                  <td className="tnum py-2.5 pl-3 pr-5 text-right">{money(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>

          <Card title="Customer">
            <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
              <div>
                <dt className="text-[12px] text-[var(--admin-mute)]">Name</dt>
                <dd className="mt-0.5 font-medium">{order.customer_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-[var(--admin-mute)]">Phone</dt>
                <dd className="tnum mt-0.5">
                  {order.phone ? (
                    <a className="hover:underline" href={`tel:${order.phone.replace(/\s/g, "")}`}>
                      {order.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {order.email && (
                <div>
                  <dt className="text-[12px] text-[var(--admin-mute)]">Email</dt>
                  <dd className="mt-0.5 break-all">{order.email}</dd>
                </div>
              )}
              <div>
                <dt className="text-[12px] text-[var(--admin-mute)]">Payment</dt>
                <dd className="mt-0.5 capitalize">
                  {order.payment_method.replace(/-/g, " ")} · {order.payment_status}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[12px] text-[var(--admin-mute)]">Delivery address</dt>
                <dd className="mt-0.5 leading-relaxed">{address || "—"}</dd>
              </div>
              {order.note && (
                <div className="sm:col-span-2">
                  <dt className="text-[12px] text-[var(--admin-mute)]">Note on the order</dt>
                  <dd className="mt-0.5 leading-relaxed">{order.note}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Timeline" bodyClassName="p-0">
            <ol className="divide-y divide-[var(--admin-line-soft)]">
              {events.map((e) => (
                <li key={e.id} className="flex gap-3 px-5 py-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--admin-mute-2)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-relaxed">{e.message}</span>
                    <span className="mt-0.5 block text-[11.5px] text-[var(--admin-mute)]">
                      {dateTime(e.created_at)}
                      {e.actor ? ` · ${e.actor}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <OrderControls
            id={order.id}
            status={order.status}
            payment={order.payment_status}
            stockApplied={order.stock_applied}
            customerName={order.customer_name}
            customerEmail={order.email}
          />

          {me?.role !== "staff" && (
            <DangerZone
              action={removeOrder}
              hiddenName="__id"
              hiddenValue={order.id}
              confirmWord={String(order.number)}
              label="Delete order"
              description="Removes the order and its timeline. Any stock it holds goes back first. Cancel it instead if you want the record kept."
            />
          )}
        </div>
      </div>
    </>
  );
}
