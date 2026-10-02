import type { Metadata } from "next";
import "./globals.css";

/**
 * Root layout — document shell only.
 *
 * The storefront chrome (header, footer, motion provider) lives in the (site)
 * group, and the dashboard brings its own. Everything shared between them,
 * which is the font loading and the stylesheet, stays here.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "WTC", template: "%s — WTC" },
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
        {/* A page opens at its top. Reloading, or reopening a tab, used to
            restore the old position — or jump to a #section left in the
            address — so the homepage opened on the Strap Studio. Runs before
            the body is parsed, so there is no jump to undo. Moving to a
            section from a link on the site still works: those are handled
            after load. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{history.scrollRestoration='manual';if(location.hash){history.replaceState(history.state,'',location.pathname+location.search)}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
