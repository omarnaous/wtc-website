import OrderSealPlayer from "@/components/order/OrderSealPlayer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/store/orders";
import { getSection, list, str } from "@/lib/store/content";
import { getSettings } from "@/lib/store/settings";
import { usd } from "@/lib/format";
import { thumb } from "@/lib/thumb";
export { dynamic } from "@/lib/runtime";

export const metadata: Metadata = {
  title: "Your order",
  // A receipt with a name and address on it has no business in an index.
  robots: { index: false, follow: false },
};

/**
 * The receipt.
 *
 * The order id is a random UUID, so the URL is the capability — there is no
 * account to log into, and nobody can walk the order numbers. It is also the
 * link a customer keeps to check on the order later.
 */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getOrder(id);
  if (!found) notFound();

  const { order, items } = found;
  const [copy, { contact }] = await Promise.all([getSection("orderPage"), getSettings()]);
  const steps = list<{ title: string; copy: string }>(copy, "steps");

  const address = [order.address_line, order.area, order.city, order.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-32 sm:px-6">
      <OrderSealPlayer />
      <p className="eyebrow mt-6">{str(copy, "eyebrow")}</p>
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.04] tracking-[-0.03em]">
        {str(copy, "title")}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mute">{str(copy, "copy")}</p>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface/40 px-5 py-4 text-[13px]">
        <span>
          <span className="text-mute">Order</span>{" "}
          <span className="font-display font-semibold">#{order.number}</span>
        </span>
        <span>
          <span className="text-mute">Status</span> <span className="capitalize">{order.status}</span>
        </span>
        <span>
          <span className="text-mute">Payment</span>{" "}
          {order.payment_method.replace(/-/g, " ")}
        </span>
      </div>

      <section className="mt-10">
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                {item.image && (
                  <Image src={thumb(item.image)} alt="" fill sizes="56px" className="object-contain p-1" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px]">{item.name}</span>
                <span className="text-[11px] text-mute-2">
                  {item.kind === "watch" ? "Watch" : "Strap"} · {usd(item.unit_price)} × {item.qty}
                </span>
              </span>
              <span className="shrink-0 text-[14px]">{usd(item.unit_price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-mute">Subtotal</dt>
            <dd>{usd(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mute">Delivery</dt>
            <dd>{order.shipping === 0 ? "Free" : usd(order.shipping)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-mute">Discount</dt>
              <dd>−{usd(order.discount)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="text-sm">Total</dt>
            <dd className="font-display text-xl font-semibold">{usd(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="eyebrow">Delivering to</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            {order.customer_name}
            <br />
            <span className="text-mute">{address}</span>
            <br />
            <span className="text-mute">{order.phone}</span>
          </p>
        </div>

        {steps.length > 0 && (
          <div>
            <h2 className="eyebrow">{str(copy, "nextHeading")}</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[13px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[11px] text-mute">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{s.title}</span>
                    <span className="text-mute">{s.copy}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <p className="mt-10 rounded-2xl border border-line bg-surface/40 px-5 py-4 text-[12px] leading-relaxed text-mute">
        {str(copy, "keepLink")}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/products"
          className="rounded-full border border-line px-6 py-3 text-[12px] text-chalk transition-colors hover:border-gold hover:text-gold"
        >
          Keep browsing
        </Link>
        {contact.whatsapp && (
          <a
            href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
              `Hi WTC — about order #${order.number}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-6 py-3 text-[12px] text-chalk transition-colors hover:border-gold hover:text-gold"
          >
            Ask about this order
          </a>
        )}
      </div>
    </div>
  );
}
