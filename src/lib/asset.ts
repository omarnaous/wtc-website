/**
 * Prefix for files served straight out of /public.
 *
 * `next/image` and `next/link` apply basePath themselves; raw <img> tags and
 * Remotion's <Img> do not, so those go through `asset()`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
