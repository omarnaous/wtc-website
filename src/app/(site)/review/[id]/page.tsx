import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/sections/Reviews";
import { getOrder } from "@/lib/store/orders";
import { listStorefrontProducts } from "@/lib/store/products";
import { thumb } from "@/lib/thumb";
export { dynamic } from "@/lib/runtime";

export const metadata: Metadata = {
  title: "Leave a review",
  robots: { index: false, follow: false },
};

/**
 * Where the "delivered" email's review button lands: the review form for one
 * order, already filled in with the customer's name, their city and the watch
 * they bought. What they send goes to Dashboard → Reviews like any other
 * review written on the site, hidden until it is published.
 */
export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [found, products] = await Promise.all([getOrder(id), listStorefrontProducts()]);
  if (!found) notFound();
  const { order, items } = found;

  const first = order.customer_name.split(/\s+/)[0] || order.customer_name;
  // "Joseph N." — a first name and an initial, as reviews usually read.
  const parts = order.customer_name.trim().split(/\s+/);
  const author = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
  const watch = items.find((i) => i.kind === "watch");
  const productNames = Object.fromEntries(products.map((p) => [p.slug, p.name]));
  const productSlug = watch && productNames[watch.ref] ? watch.ref : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:px-6">
      <p className="eyebrow">Order #{order.number}</p>
      <h1 className="mt-4 font-display text-[clamp(1.9rem,5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em]">
        How did it land, <span className="font-serif font-normal italic text-gold-soft">{first}?</span>
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mute">
        A few lines about the watch, the strap or the delivery. It goes up on the site with your
        name once we have read it.
      </p>

      {items.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface/40 py-2 pl-2 pr-4"
            >
              <span className="h-12 w-12 overflow-hidden rounded-xl border border-line bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {i.image && <img src={thumb(i.image)} alt="" className="h-full w-full object-contain p-1" />}
              </span>
              <span className="text-[13px]">{i.name}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 rounded-3xl border border-gold/30 bevel bg-[radial-gradient(ellipse_at_20%_0%,#17171c_0%,#111114_60%,#0c0c0f_100%)] p-6 sm:p-8">
        <ReviewForm
          productNames={productNames}
          defaults={{ author, location: order.city || order.area || undefined, productSlug }}
        />
      </div>
    </div>
  );
}
