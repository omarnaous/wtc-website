import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { site } from "@/data/site";

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in the deployment environment so Open Graph
  // images resolve to absolute URLs.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${site.name} — ${site.longName} | OMEGA × Swatch MoonSwatch`,
    template: `%s — ${site.name}`,
  },
  description: site.blurb,
  // This is a client preview with placeholder pricing — keep it out of search
  // results. Remove when the real catalogue and prices go live.
  robots: { index: false, follow: false },
  openGraph: {
    title: `${site.name} — ${site.longName}`,
    description: site.blurb,
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink text-chalk antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
