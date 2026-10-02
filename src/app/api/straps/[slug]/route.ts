import { NextResponse } from "next/server";
import { strapsForProduct } from "@/lib/store/straps";

/**
 * The straps pictured on one watch, for the homepage Strap Studio.
 *
 * The homepage used to carry every watch's set in its markup — some 1,800
 * entries and most of a 775 KB page — so it could switch watch instantly.
 * Now it carries the featured watch's set and asks for another only when
 * that watch is picked.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const straps = await strapsForProduct(slug);
  return NextResponse.json(straps, {
    headers: { "cache-control": "public, max-age=60" },
  });
}
