import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Stock moved onto the things it counts.
 *
 * Watches carry their own stock columns on /admin/products and straps on
 * /admin/straps, so there is no separate sheet to come to any more. Kept as a
 * redirect rather than deleted: the link is in people's history and in the
 * low-stock badge of older sessions.
 */
export default function InventoryPage() {
  redirect("/admin/products");
}
