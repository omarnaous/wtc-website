/**
 * Which build this is.
 *
 * Two targets share this codebase: Cloudflare Workers (the real shop, with D1
 * behind it) and a static export for GitHub Pages (a frozen design preview
 * with no server at all).
 */

const staticExport = process.env.STATIC_EXPORT === "1";

/**
 * Render mode for pages that read from D1. On Workers they must render per
 * request, or a dashboard edit would not show until the next deploy.
 *
 * Note: vinext and Next both classify routes by static analysis, so a page
 * that re-exports this reads as "unknown" rather than dynamic. Pages that must
 * be dynamic declare `export const dynamic = "force-dynamic"` literally; this
 * export remains only for the storefront pages, which are correct either way.
 */
export const dynamic = staticExport ? ("force-static" as const) : ("force-dynamic" as const);

/**
 * Whether anything can actually be bought.
 *
 * The bag is priced by the server and checkout is a server action, neither of
 * which survives a static export. Rather than ship a preview with a bag button
 * that leads nowhere, the commerce surface is hidden in that build and the
 * WhatsApp route is left as the way to buy — which is how WTC sold before this
 * site existed.
 */
export const COMMERCE_ENABLED = !staticExport;
