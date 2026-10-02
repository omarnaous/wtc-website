import { NextResponse } from "next/server";
import { listStorefrontProducts } from "@/lib/store/products";
import { thumb } from "@/lib/thumb";

/**
 * The header search's index: every watch on sale, cut down to what a result
 * row draws. Fetched once, the first time the search is opened, and filtered
 * in the browser from then on — 30-odd rows is less than one product photo.
 */
export async function GET() {
  const products = await listStorefrontProducts();
  const index = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    family: p.familyLabel,
    colorway: p.colorway,
    price: p.price,
    image: thumb(p.images.front),
    bestseller: p.bestsellerRank ?? null,
  }));

  return NextResponse.json(index, {
    headers: { "cache-control": "public, max-age=60" },
  });
}
