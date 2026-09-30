import { NextResponse, type NextRequest } from "next/server";

/**
 * The catalogue photography lives in R2, not in public/.
 *
 * Every image path the site has ever stored — in D1 rows, orders, the data
 * files — is a public/-style path like /products/watches/SO33M100_sa200.png.
 * Rather than rewrite all of them, those same URLs are answered from the
 * MEDIA bucket under the same key, so nothing that points at an image has to
 * change and no image has to ship with a deploy. Upload with `npm run media:push`.
 */
const IMAGE = /^\/(products|brand|instagram)\/.+\.(png|webp|jpe?g|avif|svg)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!IMAGE.test(pathname)) return NextResponse.next();
  return NextResponse.rewrite(new URL(`/api/media${pathname}`, request.url));
}

export const config = {
  matcher: ["/products/:path+", "/brand/:path+", "/instagram/:path+"],
};
