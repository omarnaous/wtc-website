import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/product/Badge";
import StrapStudio from "@/components/strap/StrapStudio";
import AddToCart from "@/components/cart/AddToCart";
import ProductCard from "@/components/product/ProductCard";
import StickyBuy from "@/components/product/StickyBuy";
import Gallery from "@/components/product/Gallery";
import { findStorefrontProduct, listStorefrontProducts } from "@/lib/store/products";
import { getStrap, strapSetsFor } from "@/lib/store/straps";
import { getSettings, getSections, list, listCollections, str } from "@/lib/store/storefront";
import { usd } from "@/lib/format";
import { studioLabels } from "@/lib/content/studio";
export { dynamic } from "@/lib/runtime";
import { COMMERCE_ENABLED } from "@/lib/runtime";
import ScrollList from "@/components/motion/ScrollList";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL, abs, snippet } from "@/lib/seo";

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
  const [p, collections] = await Promise.all([findStorefrontProduct(slug), listCollections()]);
  if (!p) return {};
  const house = collections.find((c) => c.id === p.collection)?.name ?? "";
  // "Omega × Swatch Mission to the Moon SO33M100 — Price in Lebanon": the
  // collab, the model, the reference and the place — the words a search
  // for this watch is made of.
  const title = `${house ? `${house} ` : ""}${p.name} ${p.sku} — Price in Lebanon`;
  const description = snippet(
    `${p.name} (${p.sku}), ${p.colorway} — ${usd(p.price)}. Authentic ${house || "Swatch"}, checked in hand by WTC in Beirut, cash on delivery across Lebanon. ${p.description}`,
  );
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      title,
      description,
      url: `/products/${p.slug}`,
      images: [{ url: p.images.front, alt: p.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [p.images.front] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, products, sections, { contact }, collections] = await Promise.all([
    findStorefrontProduct(slug),
    listStorefrontProducts(),
    getSections(["productPage", "strapStudio"]),
    getSettings(),
    listCollections(),
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
  const soldOut = product.availability === "sold-out";
  // How many can go in the bag: what is on hand and not already held for an
  // order. Untracked stock has no ceiling but the bag's own.
  const inStock = product.stock.track
    ? Math.max(0, product.stock.onHand - product.stock.reserved)
    : null;
  const inquire = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
        str(copy, "whatsappMessage", "Hi — is the {name} ({sku}) available?")
          .replace("{name}", product.name)
          .replace("{sku}", product.sku),
      )}`
    : "";
  // The watch as a product, for search results that show price and stock,
  // and the trail back to the catalogue.
  const house = collections.find((c) => c.id === product.collection)?.name ?? "";
  const availability = {
    "in-stock": "https://schema.org/InStock",
    "low-stock": "https://schema.org/LimitedAvailability",
    "pre-order": "https://schema.org/PreOrder",
    "sold-out": "https://schema.org/OutOfStock",
  }[product.availability];
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": abs(`/products/${product.slug}#product`),
      name: `${house ? `${house} ` : ""}${product.name}`,
      sku: product.sku,
      mpn: product.sku,
      color: product.colorway,
      description: product.description,
      image: (product.photos?.length ? product.photos : [product.images.front]).map(abs),
      brand: { "@type": "Brand", name: house || "Swatch" },
      category: "Watches",
      url: abs(`/products/${product.slug}`),
      offers: {
        "@type": "Offer",
        url: abs(`/products/${product.slug}`),
        priceCurrency: "USD",
        price: product.price.toFixed(2),
        availability,
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "Watchtradechronicles", url: SITE_URL },
        areaServed: "LB",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Catalogue", item: abs("/products") },
        { "@type": "ListItem", position: 3, name: product.name, item: abs(`/products/${product.slug}`) },
      ],
    },
  ];
  const related = products
    .filter((p) => p.family === product.family && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="pt-28">
      <JsonLd data={structured} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <nav className="text-[12px] text-mute-2">
          <Link href="/" className="hit hover:text-chalk">
            {str(copy, "homeLabel", "Home")}
          </Link>
          <span className="px-2">/</span>
          <Link href="/products" className="hit hover:text-chalk">
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

            {/* In stock: the bag, and nothing competing with it. Out of stock:
                says so, and the way to ask about the next one is WhatsApp. */}
            <div id="buy-inline" className="mt-8 flex flex-wrap items-center gap-3">
              {soldOut ? (
                <>
                  <p className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-mute">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mute-2" />
                    Out of stock
                  </p>
                  {inquire && (
                    <a
                      href={inquire}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-chalk px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
                    >
                      Inquire on WhatsApp
                    </a>
                  )}
                </>
              ) : (
                COMMERCE_ENABLED && (
                  <AddToCart
                    kind="watch"
                    refId={product.slug}
                    label={str(copy, "buyLabel", "Add to bag")}
                    max={inStock}
                    className="min-w-[11rem]"
                  />
                )
              )}
            </div>

            {footerNote && <p className="mt-5 text-[12px] text-mute-2">{footerNote}</p>}

            {specs.length > 0 && (
              <div className="mt-10 border-t border-line pt-8">
                {str(copy, "specsHeading") && (
                  <p className="eyebrow mb-5">{str(copy, "specsHeading")}</p>
                )}
                <dl className="pop-stagger grid grid-cols-2 gap-x-6 gap-y-4">
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

      {COMMERCE_ENABLED && (
        <StickyBuy
          slug={product.slug}
          name={product.name}
          price={product.price}
          image={product.images.front}
          label={str(copy, "buyLabel", "Add to bag")}
          addedLabel={str(copy, "addedLabel", "Added to bag")}
          soldOut={soldOut}
          soldOutLabel="Out of stock"
          inquire={inquire}
          max={inStock}
          watch={["buy-inline", "strap-studio"]}
        />
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
            <ScrollList className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </ScrollList>
          </div>
        </section>
      )}
    </div>
  );
}
