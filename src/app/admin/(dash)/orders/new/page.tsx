import OrderBuilder, { type Sellable } from "@/components/admin/OrderBuilder";
import { PageHeader } from "@/components/admin/ui";
import { listAllProducts } from "@/lib/store/products";
import { listStraps } from "@/lib/store/straps";

export const dynamic = "force-dynamic";

export const metadata = { title: "Record an order" };

export default async function NewOrderPage() {
  const [products, straps] = await Promise.all([listAllProducts(), listStraps()]);

  const catalogue: Sellable[] = [
    ...products
      .filter((p) => p.status === "active")
      .map((p) => ({
        kind: "watch" as const,
        ref: p.slug,
        name: p.name,
        detail: p.sku,
        price: p.price,
        image: p.images.front,
        free: p.stock.track ? p.stock.onHand - p.stock.reserved : null,
      })),
    ...straps
      .filter((s) => s.status === "active")
      .map((s) => ({
        kind: "strap" as const,
        ref: s.sku,
        name: s.name,
        detail: `Strap · ${s.sku}`,
        price: s.price,
        image: s.image,
        free: s.track ? s.onHand : null,
      })),
  ];

  return (
    <>
      <PageHeader
        title="Record an order"
        subtitle="For anything sold over WhatsApp, Instagram or across the counter."
        back={{ href: "/admin/orders", label: "Orders" }}
      />
      <OrderBuilder catalogue={catalogue} />
    </>
  );
}
