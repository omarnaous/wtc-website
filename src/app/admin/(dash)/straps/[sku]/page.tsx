import Link from "next/link";
import { notFound } from "next/navigation";
import DangerZone from "@/components/admin/DangerZone";
import StrapForm from "@/components/admin/StrapForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { getStrap } from "@/lib/store/straps";
import { listAllProducts } from "@/lib/store/products";
import { tryAll } from "@/lib/db/sql";
import { deleteStrap, saveStrap } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const strap = await getStrap(decodeURIComponent(sku));
  return { title: strap?.name ?? "Strap" };
}

export default async function StrapPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku: raw } = await params;
  const sku = decodeURIComponent(raw);
  const [strap, products] = await Promise.all([getStrap(sku), listAllProducts()]);
  if (!strap) notFound();

  const fitted = await tryAll<{ product_slug: string; name: string }>(
    `SELECT ps.product_slug, p.name
       FROM product_straps ps JOIN products p ON p.slug = ps.product_slug
      WHERE ps.strap_sku = ? ORDER BY p.name`,
    [sku],
  );

  return (
    <>
      <PageHeader
        title={strap.name}
        subtitle={strap.sku}
        back={{ href: "/admin/straps", label: "Straps" }}
      />

      <div className="space-y-4">
        <StrapForm
          strap={strap}
          products={products.map((p) => ({ value: p.slug, label: p.name }))}
          action={saveStrap}
        />

        <Card
          title="Fitted to"
          description="The watches whose Strap Studio offers this strap. Change the list on the watch itself."
        >
          {fitted.length === 0 ? (
            <p className="text-[13px] text-[var(--admin-mute)]">
              Not offered on any watch yet.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {fitted.map((f) => (
                <li key={f.product_slug}>
                  <Link
                    href={`/admin/products/${f.product_slug}`}
                    className="inline-block rounded-full border border-[var(--admin-line)] px-3 py-1 text-[12.5px] transition-colors hover:border-[var(--admin-text)]"
                  >
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <DangerZone
          action={deleteStrap}
          hiddenName="__sku"
          hiddenValue={strap.sku}
          confirmWord={strap.sku}
          label="Delete this strap"
          description="Removes it from the catalogue and from every watch it is fitted to."
        />
      </div>
    </>
  );
}
