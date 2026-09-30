import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/product/Badge";
import StrapStudio from "@/components/strap/StrapStudio";
import AddToCart from "@/components/cart/AddToCart";
import ProductCard from "@/components/product/ProductCard";
import Gallery from "@/components/product/Gallery";
import { getProduct, getStorefrontProduct, listStorefrontProducts } from "@/lib/store/products";
import { getStrap, strapSetsFor } from "@/lib/store/straps";
import { getSettings } from "@/lib/store/settings";
import { getSections, list, str } from "@/lib/store/content";
import { usd } from "@/lib/format";
import { studioLabels } from "@/lib/content/studio";
export { dynamic } from "@/lib/runtime";
import { COMMERCE_ENABLED } from "@/lib/runtime";

export async function generateStaticParams() {
  const products = await listStorefrontProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name} (${p.sku})`,
    description: p.description,
    openGraph: { images: [{ url: p.images.front }] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, products, sections, { contact }] = await Promise.all([
    getStorefrontProduct(slug),
    listStorefrontProducts(),
    getSections(["productPage", "strapStudio"]),
    getSettings(),
  ]);
  const copy = sections.productPage;
  const studio = sections.strapStudio;
  if (!product || product.status !== "active") notFound();

  const [stock, strapSets] = await Promise.all([
    product.stockStrapSku ? getStrap(product.stockStrapSku) : Promise.resolve(null),
    strapSetsFor([product.slug]),
  ]);
  const straps = strapSets[product.slug] ?? [];

  // The line under the buy buttons. A watch may carry its own; otherwise the
  // shared sentence is used, and only when we know which strap it ships on —
  // that sentence names the strap.
  const footerNote =
    product.footerNote?.trim() ||
    (stock ? str(copy, "includedNote").replace("{strap}", stock.name) : "");

  // This watch's own specification, or the shared rows when it has none.
  const specs = product.specs?.length
    ? product.specs
    : list<{ label: string; value: string }>(copy, "specs");
  const related = products
    .filter((p) => p.family === product.family && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <nav className="text-[12px] text-mute-2">
          <Link href="/" className="hover:text-chalk">
            {str(copy, "homeLabel", "Home")}
          </Link>
          <span className="px-2">/</span>
          <Link href="/products" className="hover:text-chalk">
            {str(copy, "catalogueLabel", "Catalogue")}
          </Link>
          <span className="px-2">/</span>
          <span className="text-mute">{product.name}</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Gallery product={product} />

          <div className="lg:pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge availability={product.availability} />
              <span className="rounded-full border border-line px-3 py-1 text-[11px] text-mute">
                {product.familyLabel}
              </span>
              <span className="text-[11px] text-mute-2">{product.year}</span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(1.9rem,4.2vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-mute-2">
              {product.sku} · {product.colorway}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <p className="font-display text-3xl font-semibold">{usd(product.price)}</p>
              {product.compareAt && (
                <p className="text-sm text-mute-2 line-through">{usd(product.compareAt)}</p>
              )}
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-mute">{product.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {COMMERCE_ENABLED && (
                <AddToCart
                  kind="watch"
                  refId={product.slug}
                  label={str(copy, "buyLabel", "Add to bag")}
                  addedLabel={str(copy, "addedLabel", "Added to bag")}
                  soldOut={product.availability === "sold-out"}
                  soldOutLabel={str(copy, "soldOutLabel", "Sold out")}
                  /* Straight on to the straps that fit it. Nothing happens
                     when this watch has none — the section is not rendered. */
                  scrollTo="strap-studio"
                />
              )}
              <a
                href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
                  str(copy, "whatsappMessage", "Hi — is the {name} ({sku}) available?")
                    .replace("{name}", product.name)
                    .replace("{sku}", product.sku),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-7 py-3.5 text-sm font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
              >
                {str(copy, "whatsappLabel", "Ask on WhatsApp")}
              </a>
            </div>

            {footerNote && <p className="mt-5 text-[12px] text-mute-2">{footerNote}</p>}

            {specs.length > 0 && (
              <div className="mt-10 border-t border-line pt-8">
                {str(copy, "specsHeading") && (
                  <p className="eyebrow mb-5">{str(copy, "specsHeading")}</p>
                )}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {specs.map((spec) => (
                    <div key={spec.label}>
                      <dt className="text-[11px] uppercase tracking-[0.12em] text-mute-2">
                        {spec.label}
                      </dt>
                      <dd className="mt-1 text-sm text-chalk">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {straps.length > 0 && (
        <section id="strap-studio" className="mt-24 border-y border-line py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <p className="eyebrow">{str(copy, "strapHeading", "Strap Studio")}</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(1.6rem,3.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
              {str(copy, "strapCopy")}
            </h2>
            <div className="mt-10">
              {/* No watch picker here. This page is about one watch, and
                  offering the other twenty-five inside it turned a strap
                  section into a second catalogue. */}
              <StrapStudio
                product={product}
                sets={{ [product.slug]: straps }}
                labels={studioLabels(studio)}
                commerce={COMMERCE_ENABLED}
                compact
              />
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <p className="eyebrow">
              {str(copy, "relatedHeading", "More from {series}").replace(
                "{series}",
                product.familyLabel,
              )}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
