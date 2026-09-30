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
  // A static export has no image service at all. On Workers the loader is
  // Cloudflare's edge transformer, which falls back to the plain path until
  // NEXT_PUBLIC_IMAGE_CDN names one — see src/lib/image-loader.ts.
  images: staticExport
    ? { unoptimized: true }
    : { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
};

export default nextConfig;
