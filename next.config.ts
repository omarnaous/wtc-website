import type { NextConfig } from "next";

/**
 * Built as a static export for GitHub Pages — there is no Node server, so
 * every route is prerendered to HTML and the image optimiser is off.
 *
 * NEXT_PUBLIC_BASE_PATH is the repository name when deploying to a project
 * page (https://<user>.github.io/<repo>/). Leave it unset for local dev or a
 * custom domain.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Pages serves plain files, so /products/x must resolve to /products/x/index.html
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
