"use server";

import { parseLines, type CartLine } from "@/lib/cart/types";
import { resolveCart } from "@/lib/store/cart";
import { createOrder } from "@/lib/store/orders";
import { logAudit } from "@/lib/auth/session";
import { afterResponse } from "@/lib/db/binding";
import { sendOrderEmails } from "@/lib/email/order-emails";
import { siteOrigin } from "@/lib/email/origin";

export interface CheckoutResult {
  error?: string;
  /** The placed order's id — an unguessable UUID, used as its receipt link. */
  orderId?: string;
  number?: number;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

/** Lebanese mobiles are 8 digits after the country code; landlines 7. */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const bare = digits.replace(/^\+?961/, "").replace(/^0/, "").replace(/\D/g, "");
  if (bare.length < 7 || bare.length > 8) return null;
  return `+961 ${bare}`;
}

export async function placeOrder(
  _prev: CheckoutResult,
  data: FormData,
): Promise<CheckoutResult> {
  // ── What they are buying ────────────────────────────────────────────────
  let lines: CartLine[];
  try {
    lines = parseLines(JSON.parse(String(data.get("lines") ?? "[]")));
  } catch {
    return { error: "Something went wrong reading your bag. Reload and try again." };
  }
  if (!lines.length) return { error: "Your bag is empty." };

  // Priced and stock-checked here, not in the browser — the numbers on the
  // order are the catalogue's, whatever the page was showing.
  const cart = await resolveCart(lines);
  const sellable = cart.lines.filter((l) => l.sellable > 0);
  if (!sellable.length) {
    return { error: "Nothing in your bag is available any more. Have another look at the shop." };
  }
  if (cart.adjusted) {
    return {
      error:
        "Stock changed while you were checking out — your bag has been updated. Check it and place the order again.",
    };
  }

  // ── Who they are ────────────────────────────────────────────────────────
  const name = text(data, "name");
  const phoneRaw = text(data, "phone");
  const address = text(data, "address");
  const city = text(data, "city");

  if (name.length < 2) return { error: "Enter the name the order is for." };
  if (!address) return { error: "Enter the delivery address." };
  if (!city) return { error: "Enter the city or area." };

  const phone = normalisePhone(phoneRaw);
  if (!phone) return { error: "Enter a Lebanese phone number we can reach you on." };

  // Required: it is where the order confirmation goes, and the browser's own
  // check can be skipped, so it is enforced here as well.
  const email = text(data, "email");
  if (!email) return { error: "Enter your email — the order confirmation is sent there." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "That email address does not look right." };
  }

  // ── Place it ────────────────────────────────────────────────────────────
  try {
    const order = await createOrder(
      {
        customer_name: name,
        phone,
        email,
        address_line: address,
        city,
        area: text(data, "area"),
        country: "Lebanon",
        channel: "website",
        // Cash on delivery is how WTC sells; there is no gateway wired up.
        payment_method: "cash-on-delivery",
        payment_status: "unpaid",
        // Pending, not confirmed: a website order is a request until someone
        // at WTC has looked at it. Pending still reserves the stock.
        status: "pending",
        shipping: cart.totals.delivery,
        note: text(data, "note"),
        items: sellable.map((l) => ({
          kind: l.kind,
          ref: l.ref,
          name: l.name,
          image: l.image,
          unit_price: l.price,
          qty: l.sellable,
        })),
      },
      "website",
    );

    await logAudit(null, "create", "order", order.id, `Order #${order.number} placed on the site.`);

    // The confirmation and the shop's alert go out after the response: the
    // customer sees their receipt at once, and a slow or failing email
    // provider can neither delay nor undo an order that has been placed.
    const origin = await siteOrigin();
    await afterResponse(
      sendOrderEmails(
        order,
        sellable.map((l) => ({ name: l.name, qty: l.sellable, unit_price: l.price, image: l.image, kind: l.kind })),
        origin,
      ),
    );

    return { orderId: order.id, number: order.number };
  } catch {
    return {
      error:
        "We could not place the order just now. Nothing has been charged — try again, or message us on WhatsApp.",
    };
  }
}
