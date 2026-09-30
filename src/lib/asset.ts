/**
 * Prefix for files served straight out of /public.
 *
 * `next/image` and `next/link` apply basePath themselves; raw <img> tags and
 * Remotion's <Img> do not, so those go through `asset()`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Where the photography is served from when it is not this origin.
 *
 * The images live in R2 and the Worker answers /products/…, /brand/… and
 * /instagram/… from it (src/middleware.ts). The GitHub Pages export has no
 * Worker, so its build points them at the live shop instead.
 */
export const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_ORIGIN ?? "").replace(/\/$/, "");

const MEDIA = /^\/(products|brand|instagram)\//;

export const asset = (path: string) => {
  if (/^(https?:|data:)/.test(path) || (BASE_PATH && path.startsWith(`${BASE_PATH}/`))) {
    return path;
  }
  if (MEDIA_ORIGIN && MEDIA.test(path)) return `${MEDIA_ORIGIN}${path}`;
  return `${BASE_PATH}${path}`;
};
