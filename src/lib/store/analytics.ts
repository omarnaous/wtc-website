import { all, first } from "@/lib/db/sql";

/**
 * Order analytics, computed in SQL rather than in the page — the dashboard
 * loads one screen at a time and D1 does this work far faster than pulling
 * every order across the wire and reducing it in JS.
 *
 * Cancelled and refunded orders are excluded from revenue everywhere.
 */

const EARNING = `status NOT IN ('cancelled','refunded')`;

export interface Totals {
  orders: number;
  revenue: number;
  units: number;
  aov: number;
}

export async function totals(days: number): Promise<Totals> {
  const row = await first<{ orders: number; revenue: number; units: number }>(
    `SELECT COUNT(*) AS orders,
            COALESCE(SUM(total), 0) AS revenue,
            COALESCE((SELECT SUM(i.qty) FROM order_items i
                        JOIN orders o2 ON o2.id = i.order_id
                       WHERE o2.${EARNING}
                         AND o2.created_at >= datetime('now', ?)), 0) AS units
       FROM orders
      WHERE ${EARNING} AND created_at >= datetime('now', ?)`,
    `-${days} days`,
    `-${days} days`,
  );
  const orders = row?.orders ?? 0;
  const revenue = row?.revenue ?? 0;
  return { orders, revenue, units: row?.units ?? 0, aov: orders ? revenue / orders : 0 };
}

export interface DayPoint {
  day: string;
  revenue: number;
  orders: number;
}

/** Revenue per day, with empty days filled in so the chart has no gaps. */
export async function revenueByDay(days: number): Promise<DayPoint[]> {
  const rows = await all<DayPoint>(
    `SELECT date(created_at) AS day,
            COALESCE(SUM(total), 0) AS revenue,
            COUNT(*) AS orders
       FROM orders
      WHERE ${EARNING} AND created_at >= datetime('now', ?)
      GROUP BY day ORDER BY day`,
    `-${days} days`,
  );

  const found = new Map(rows.map((r) => [r.day, r]));
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    out.push(found.get(d) ?? { day: d, revenue: 0, orders: 0 });
  }
  return out;
}

export async function statusBreakdown() {
  return all<{ status: string; n: number; value: number }>(
    `SELECT status, COUNT(*) AS n, COALESCE(SUM(total),0) AS value
       FROM orders GROUP BY status`,
  );
}

export async function channelBreakdown(days: number) {
  return all<{ channel: string; n: number; value: number }>(
    `SELECT channel, COUNT(*) AS n, COALESCE(SUM(total),0) AS value
       FROM orders
      WHERE ${EARNING} AND created_at >= datetime('now', ?)
      GROUP BY channel ORDER BY value DESC`,
    `-${days} days`,
  );
}

export interface TopLine {
  ref: string;
  name: string;
  image: string;
  units: number;
  revenue: number;
}

export async function topSellers(days: number, kind: "watch" | "strap", limit = 8) {
  return all<TopLine>(
    `SELECT i.ref, i.name, MAX(i.image) AS image,
            SUM(i.qty) AS units,
            SUM(i.qty * i.unit_price) AS revenue
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
      WHERE o.${EARNING} AND i.kind = ?
        AND o.created_at >= datetime('now', ?)
      GROUP BY i.ref ORDER BY units DESC, revenue DESC
      LIMIT ?`,
    kind,
    `-${days} days`,
    limit,
  );
}

export interface LowStockLine {
  kind: "watch" | "strap";
  ref: string;
  name: string;
  on_hand: number;
  reserved: number;
  low_stock_at: number;
}

/** Everything at or under its threshold, watches and straps together. */
export async function lowStock(limit = 20): Promise<LowStockLine[]> {
  const watches = await all<LowStockLine>(
    `SELECT 'watch' AS kind, p.slug AS ref, p.name, i.on_hand, i.reserved, i.low_stock_at
       FROM inventory i JOIN products p ON p.slug = i.product_slug
      WHERE i.track = 1 AND p.status = 'active'
        AND (i.on_hand - i.reserved) <= i.low_stock_at
      ORDER BY (i.on_hand - i.reserved) ASC LIMIT ?`,
    limit,
  );
  const straps = await all<LowStockLine>(
    `SELECT 'strap' AS kind, sku AS ref, name, on_hand, 0 AS reserved, low_stock_at
       FROM straps
      WHERE track = 1 AND status = 'active' AND on_hand <= low_stock_at
      ORDER BY on_hand ASC LIMIT ?`,
    limit,
  );
  return [...watches, ...straps].sort(
    (a, b) => a.on_hand - a.reserved - (b.on_hand - b.reserved),
  );
}

export async function inventoryValue() {
  const row = await first<{ units: number; value: number }>(
    `SELECT COALESCE(SUM(i.on_hand),0) AS units,
            COALESCE(SUM(i.on_hand * p.price),0) AS value
       FROM inventory i JOIN products p ON p.slug = i.product_slug
      WHERE p.status = 'active'`,
  );
  return { units: row?.units ?? 0, value: row?.value ?? 0 };
}

/** Same window, immediately before this one — for the "vs previous" figures. */
export async function previousTotals(days: number): Promise<Totals> {
  const row = await first<{ orders: number; revenue: number }>(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
       FROM orders
      WHERE ${EARNING}
        AND created_at >= datetime('now', ?) AND created_at < datetime('now', ?)`,
    `-${days * 2} days`,
    `-${days} days`,
  );
  const orders = row?.orders ?? 0;
  const revenue = row?.revenue ?? 0;
  return { orders, revenue, units: 0, aov: orders ? revenue / orders : 0 };
}
