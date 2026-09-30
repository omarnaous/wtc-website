import { all, batch, first, run } from "@/lib/db/sql";
import { newId } from "@/lib/auth/password";
import type { OrderStatus } from "@/lib/orders/constants";

export type { OrderStatus };

export interface OrderItem {
  id: string;
  order_id: string;
  kind: "watch" | "strap";
  ref: string;
  name: string;
  image: string;
  unit_price: number;
  qty: number;
  position: number;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  payment_status: "unpaid" | "paid" | "refunded";
  payment_method: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address_line: string;
  city: string;
  area: string;
  country: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  channel: string;
  note: string;
  stock_applied: number;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: number;
  order_id: string;
  type: string;
  message: string;
  actor: string | null;
  created_at: string;
}

/**
 * Stock moves in three states, tracked on the order itself so a status change
 * can never double-count: 0 nothing held, 1 reserved, 2 taken off the count.
 *
 * Only 0 and 2 are used. An order takes its watches off the count the moment
 * it is placed and puts them back only if it is cancelled or refunded — so the
 * one number the dashboard shows is what is still available to sell, and it
 * moves on its own as orders come in. The middle state is kept because orders
 * placed under the older behaviour are sitting in it, and the delta below
 * unwinds them correctly on their next status change.
 *
 * Stock here is single digits and often a single piece, so holding from
 * `pending` rather than from `shipped` matters: two customers checking out the
 * last Moonphase a minute apart both have a claim on it, and the first should
 * win rather than both being told yes.
 */
const STOCK_STATE: Record<OrderStatus, 0 | 1 | 2> = {
  pending: 2,
  confirmed: 2,
  packed: 2,
  shipped: 2,
  delivered: 2,
  cancelled: 0,
  refunded: 0,
};

export async function listOrders(opts: {
  status?: string;
  q?: string;
  channel?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ orders: (Order & { items: number })[]; total: number }> {
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts.status && opts.status !== "all") {
    where.push("o.status = ?");
    params.push(opts.status);
  }
  if (opts.channel && opts.channel !== "all") {
    where.push("o.channel = ?");
    params.push(opts.channel);
  }
  if (opts.q) {
    where.push("(o.customer_name LIKE ? OR o.phone LIKE ? OR CAST(o.number AS TEXT) LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  const orders = await all<Order & { items: number }>(
    `SELECT o.*, (SELECT COALESCE(SUM(qty),0) FROM order_items i WHERE i.order_id = o.id) AS items
       FROM orders o ${clause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
  const count = await first<{ n: number }>(
    `SELECT COUNT(*) AS n FROM orders o ${clause}`,
    ...params,
  );
  return { orders, total: count?.n ?? 0 };
}

export async function getOrder(id: string) {
  const order = await first<Order>(`SELECT * FROM orders WHERE id = ?`, id);
  if (!order) return null;
  const items = await all<OrderItem>(
    `SELECT * FROM order_items WHERE order_id = ? ORDER BY position`,
    id,
  );
  const events = await all<OrderEvent>(
    `SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at DESC, id DESC`,
    id,
  );
  return { order, items, events };
}

export interface NewOrderInput {
  customer_name: string;
  phone: string;
  email?: string;
  address_line?: string;
  city?: string;
  area?: string;
  country?: string;
  channel?: string;
  payment_method?: string;
  payment_status?: "unpaid" | "paid" | "refunded";
  status?: OrderStatus;
  shipping?: number;
  discount?: number;
  note?: string;
  items: { kind: "watch" | "strap"; ref: string; name: string; image?: string; unit_price: number; qty: number }[];
}

export async function createOrder(input: NewOrderInput, actor: string): Promise<Order> {
  const id = newId();
  const max = await first<{ n: number }>(`SELECT COALESCE(MAX(number), 1000) AS n FROM orders`);
  const number = (max?.n ?? 1000) + 1;

  const subtotal = input.items.reduce((sum, i) => sum + i.unit_price * i.qty, 0);
  const shipping = input.shipping ?? 0;
  const discount = input.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const status = input.status ?? "pending";

  const statements = [
    {
      sql: `INSERT INTO orders
              (id, number, status, payment_status, payment_method, customer_name, phone, email,
               address_line, city, area, country, subtotal, shipping, discount, total,
               channel, note, stock_applied)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
      params: [
        id,
        number,
        status,
        input.payment_status ?? "unpaid",
        input.payment_method ?? "cash-on-delivery",
        input.customer_name,
        input.phone,
        input.email ?? null,
        input.address_line ?? "",
        input.city ?? "",
        input.area ?? "",
        input.country ?? "Lebanon",
        subtotal,
        shipping,
        discount,
        total,
        input.channel ?? "website",
        input.note ?? "",
      ],
    },
    ...input.items.map((item, i) => ({
      sql: `INSERT INTO order_items (id, order_id, kind, ref, name, image, unit_price, qty, position)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      params: [
        newId(),
        id,
        item.kind,
        item.ref,
        item.name,
        item.image ?? "",
        item.unit_price,
        item.qty,
        i,
      ],
    })),
    {
      sql: `INSERT INTO order_events (order_id, type, message, actor) VALUES (?,?,?,?)`,
      params: [id, "created", `Order created with ${input.items.length} line(s).`, actor],
    },
  ];

  await batch(statements);
  await syncStock(id, status, actor);
  return (await first<Order>(`SELECT * FROM orders WHERE id = ?`, id))!;
}

/**
 * Move the order's stock hold to whatever its status implies. Idempotent:
 * called again with the same status it does nothing.
 */
async function syncStock(orderId: string, status: OrderStatus, actor: string) {
  const order = await first<Order>(`SELECT * FROM orders WHERE id = ?`, orderId);
  if (!order) return;

  const from = (order.stock_applied ?? 0) as 0 | 1 | 2;
  const to = STOCK_STATE[status];
  if (from === to) return;

  const items = await all<OrderItem>(
    `SELECT * FROM order_items WHERE order_id = ? AND kind = 'watch'`,
    orderId,
  );
  const strapItems = await all<OrderItem>(
    `SELECT * FROM order_items WHERE order_id = ? AND kind = 'strap'`,
    orderId,
  );

  const statements: { sql: string; params: unknown[] }[] = [];

  for (const item of items) {
    // Undo whatever the previous state held, then apply the new one. Doing it
    // as a delta keeps every transition — including backwards ones — correct.
    let reserved = 0;
    let onHand = 0;
    if (from === 1) reserved -= item.qty;
    if (from === 2) onHand += item.qty;
    if (to === 1) reserved += item.qty;
    if (to === 2) onHand -= item.qty;
    if (reserved === 0 && onHand === 0) continue;
    statements.push({
      sql: `UPDATE inventory
               SET reserved = MAX(0, reserved + ?), on_hand = on_hand + ?,
                   updated_at = datetime('now')
             WHERE product_slug = ?`,
      params: [reserved, onHand, item.ref],
    });
  }

  for (const item of strapItems) {
    let onHand = 0;
    if (from === 2) onHand += item.qty;
    if (to === 2) onHand -= item.qty;
    if (onHand === 0) continue;
    statements.push({
      sql: `UPDATE straps SET on_hand = on_hand + ?, updated_at = datetime('now') WHERE sku = ?`,
      params: [onHand, item.ref],
    });
  }

  statements.push({
    sql: `UPDATE orders SET stock_applied = ?, updated_at = datetime('now') WHERE id = ?`,
    params: [to, orderId],
  });

  if (statements.length) await batch(statements);

  if (from !== to) {
    const word = to === 0 ? "released" : to === 1 ? "reserved" : "deducted";
    await run(
      `INSERT INTO order_events (order_id, type, message, actor) VALUES (?,?,?,?)`,
      orderId,
      "stock",
      `Stock ${word}.`,
      actor,
    );
  }
}

export async function setOrderStatus(id: string, status: OrderStatus, actor: string) {
  const before = await first<Order>(`SELECT status FROM orders WHERE id = ?`, id);
  if (!before || before.status === status) return;
  await run(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`, status, id);
  await run(
    `INSERT INTO order_events (order_id, type, message, actor) VALUES (?,?,?,?)`,
    id,
    "status",
    `Status changed from ${before.status} to ${status}.`,
    actor,
  );
  await syncStock(id, status, actor);
}

export async function setPaymentStatus(
  id: string,
  payment: "unpaid" | "paid" | "refunded",
  actor: string,
) {
  await run(
    `UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ?`,
    payment,
    id,
  );
  await run(
    `INSERT INTO order_events (order_id, type, message, actor) VALUES (?,?,?,?)`,
    id,
    "payment",
    `Marked ${payment}.`,
    actor,
  );
}

export async function addOrderNote(id: string, message: string, actor: string) {
  await run(
    `INSERT INTO order_events (order_id, type, message, actor) VALUES (?,?,?,?)`,
    id,
    "note",
    message,
    actor,
  );
}

export async function deleteOrder(id: string, actor: string) {
  // Put any held stock back before the rows go.
  await syncStock(id, "cancelled", actor);
  await run(`DELETE FROM orders WHERE id = ?`, id);
}
