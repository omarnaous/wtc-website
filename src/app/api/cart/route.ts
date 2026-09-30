import { NextResponse } from "next/server";
import { parseLines } from "@/lib/cart/types";
import { resolveCart } from "@/lib/store/cart";

/**
 * Prices the cart. The browser sends references and quantities; everything
 * that comes back — names, prices, what is actually in stock — is read from
 * D1 here. Nothing the client sends is trusted beyond "which items".
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const lines = parseLines((body as { lines?: unknown })?.lines);
  const cart = await resolveCart(lines);

  return NextResponse.json(cart, {
    // Per-customer and stock-dependent: never cache it anywhere.
    headers: { "cache-control": "no-store" },
  });
}
