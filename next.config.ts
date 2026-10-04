import type { NextConfig } from "next";

/**
 * Two deployment targets share this config.
 *
 *  - Cloudflare Workers (the live site, via vinext): a normal Next.js app, so
 *    routes can render per request and read from D1.
 *  - GitHub Pages (the frozen client preview): a static export under a
 *    basePath, driven by STATIC_EXPORT=1 in scripts/deploy-pages.sh.
 *
 * `next dev` and `vinext dev` both take the Workers branch.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = staticExport ? process.env.NEXT_PUBLIC_BASE_PATH ?? "" : "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export" as const,
        // Pages serves plain files, so /products/x must resolve to
        // /products/x/index.html
        trailingSlash: true,
        basePath: basePath || undefined,
      }
    : {}),
  // Images are drawn as they are stored. The photographs already come in
  // card-sized copies (src/lib/thumb.ts), and vinext's /_next/image route
  // only passed them through — one more Worker request per image, against
  // the free plan's 100,000 a day, and none at all once they are served
  // from the media bucket's own domain (src/lib/media.ts).
  images: { unoptimized: true },
};

export default nextConfig;
