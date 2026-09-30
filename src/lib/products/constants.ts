/**
 * Catalogue limits, with nothing behind them.
 *
 * Kept apart from src/lib/store/products.ts because the dashboard's product
 * form is a client component: importing a number from the store would pull the
 * D1 binding into the browser bundle, where `cloudflare:workers` does not
 * resolve and the build stops.
 */

/** How many photographs one watch may carry. */
export const MAX_PHOTOS = 5;
