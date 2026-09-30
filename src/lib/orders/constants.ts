/**
 * Order vocabulary shared by the server and the browser.
 *
 * Kept apart from src/lib/store/orders.ts on purpose: that module reaches the
 * D1 binding, and `cloudflare:workers` does not exist in a browser bundle. A
 * client component that needs the list of statuses imports it from here.
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export const ORDER_STATUSES: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "pending", label: "Pending", tone: "amber" },
  { value: "confirmed", label: "Confirmed", tone: "blue" },
  { value: "packed", label: "Packed", tone: "blue" },
  { value: "shipped", label: "Shipped", tone: "violet" },
  { value: "delivered", label: "Delivered", tone: "green" },
  { value: "cancelled", label: "Cancelled", tone: "grey" },
  { value: "refunded", label: "Refunded", tone: "red" },
];

export const CHANNELS = ["website", "instagram", "whatsapp", "walk-in"] as const;

export const statusTone = (status: string) =>
  ORDER_STATUSES.find((s) => s.value === status)?.tone ?? "grey";
