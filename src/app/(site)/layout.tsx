import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MotionProvider from "@/components/site/MotionProvider";
import SmoothAnchors from "@/components/site/SmoothAnchors";
import { CartProvider } from "@/lib/cart/CartContext";
import { getSettings } from "@/lib/store/settings";
import { getSections, flag, list, str } from "@/lib/store/content";
export { dynamic } from "@/lib/runtime";
import { COMMERCE_ENABLED } from "@/lib/runtime";

export async function generateMetadata(): Promise<Metadata> {
  const [{ brand }, sections] = await Promise.all([getSettings(), getSections(["seo"])]);
  const seo = sections.seo;
  const title = str(seo, "title") || `${brand.name} — ${brand.longName} | ${brand.location}`;
  const description = str(seo, "description") || brand.blurb;
  // Indexing stays off while prices are placeholders; Sections → Search
  // flips it at launch.
  const indexable = flag(seo, "indexable", false);
  const ogImage = str(seo, "ogImage");

  return {
    title: { default: title, template: `%s — ${brand.name}` },
    description,
    robots: { index: indexable, follow: indexable },
    openGraph: {
      title: `${brand.name} — ${brand.longName}`,
      description,
      locale: "en_US",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [{ brand, contact }, sections] = await Promise.all([
    getSettings(),
    getSections(["header"]),
  ]);
  const header = sections.header;

  return (
    <div className="bg-ink text-chalk">
      <MotionProvider>
        <SmoothAnchors />
        <CartProvider>
        <Header
          nav={list<{ label: string; href: string }>(header, "nav")}
          ctaLabel={str(header, "ctaLabel")}
          ctaHref={str(header, "ctaHref")}
          shopLabel={str(header, "shopLabel", "Shop")}
          shopHref={str(header, "shopHref", "/products")}
          whatsapp={contact.whatsapp}
          brand={{ name: brand.name, tagline: brand.tagline, logo: brand.logo }}
          commerce={COMMERCE_ENABLED}
        />
        <main>{children}</main>
        <Footer />
        </CartProvider>
      </MotionProvider>
    </div>
  );
}
