import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MotionProvider from "@/components/site/MotionProvider";
import SmoothAnchors from "@/components/site/SmoothAnchors";
import ImageLoadWatcher from "@/components/site/ImageLoadWatcher";
import { CartProvider } from "@/lib/cart/CartContext";
import { getSettings, getSections, flag, list, str } from "@/lib/store/storefront";
export { dynamic } from "@/lib/runtime";
import { COMMERCE_ENABLED } from "@/lib/runtime";
import { SITE_URL, onPrimaryHost } from "@/lib/seo";

/**
 * What every storefront page tells search engines unless it says otherwise.
 *
 * The default title and description carry what people in Lebanon actually
 * type — MoonSwatch, Omega × Swatch, the straps, Lebanon/Beirut — and both
 * stay editable in Sections → Search, which wins when filled in.
 */
const DEFAULT_TITLE =
  "WTC — Omega × Swatch MoonSwatch & Straps in Lebanon | Watchtradechronicles";
const DEFAULT_DESCRIPTION =
  "Shop authentic Omega × Swatch MoonSwatch and AP × Swatch Royal Pop in Lebanon — checked in hand, with 78 rubber and Velcro straps. Cash on delivery across Lebanon.";

export async function generateMetadata(): Promise<Metadata> {
  const [{ brand }, sections, primary] = await Promise.all([
    getSettings(),
    getSections(["seo"]),
    onPrimaryHost(),
  ]);
  const seo = sections.seo;
  const title = str(seo, "title") || DEFAULT_TITLE;
  const description = str(seo, "description") || DEFAULT_DESCRIPTION;
  // Sections → Search switches indexing on; and only the official address
  // is ever indexed — www and workers.dev answer, but as copies.
  const indexable = flag(seo, "indexable", false) && primary;
  const ogImage = str(seo, "ogImage");

  return {
    metadataBase: new URL(SITE_URL),
    // `absolute`: the homepage title as written — not run through the root
    // layout's "… — WTC" — while pages under it still get "… | WTC".
    title: { absolute: title, template: `%s | ${brand.name}` },
    description,
    applicationName: brand.longName,
    robots: indexable
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: `${brand.name} — ${brand.longName}`,
      locale: "en_US",
      type: "website",
      url: SITE_URL,
      // The share preview: the one set in Sections → Search, or the WTC mark.
      images: [{ url: ogImage || "/api/media/brand/icon-512.png" }],
    },
    twitter: { card: "summary_large_image", title, description },
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
        <ImageLoadWatcher />
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
