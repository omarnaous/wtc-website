import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/product/Badge";
import StrapStudio from "@/components/strap/StrapStudio";
import ProductCard from "@/components/product/ProductCard";
import Gallery from "@/components/product/Gallery";
import { bySlug, products } from "@/data/products";
import { strapBySku } from "@/data/straps";
import { site } from "@/data/site";
import { usd } from "@/lib/format";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name} (${p.sku})`,
    description: p.description,
    openGraph: { images: [{ url: p.images.front }] },
  };
}

const SPECS = [
  ["Case", "42 mm Bioceramic"],
  ["Movement", "Quartz chronograph"],
  ["Glass", "Bio-sourced material"],
  ["Water resistance", "3 bar"],
  ["Battery", "Renata 371"],
  ["Caseback", "Bio-sourced material, printed"],
] as const;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = bySlug(slug);
  if (!product) notFound();

  const stock = product.stockStrapSku ? strapBySku(product.stockStrapSku) : undefined;
  const related = products
    .filter((p) => p.family === product.family && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <nav className="text-[12px] text-mute-2">
          <Link href="/" className="hover:text-chalk">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link href="/products" className="hover:text-chalk">
            Catalogue
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
              <button className="rounded-full bg-chalk px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-85">
                Add to bag
              </button>
              <a
                href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
                  `Hi WTC — is the ${product.name} (${product.sku}) available?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-7 py-3.5 text-sm font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
              >
                Ask on WhatsApp
              </a>
            </div>

            {stock && (
              <p className="mt-5 text-[12px] text-mute-2">
                Supplied on the {stock.name} strap, with box and papers.
              </p>
            )}

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-8">
              {SPECS.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-mute-2">{k}</dt>
                  <dd className="mt-1 text-sm text-chalk">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-24 border-y border-line py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="eyebrow">Strap Studio</p>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(1.6rem,3.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            See this one on every strap we stock
          </h2>
          <div className="mt-10">
            <StrapStudio product={product} compact />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <p className="eyebrow">More from {product.familyLabel}</p>
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
