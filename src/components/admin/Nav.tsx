"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cx } from "./ui";
import type { Role } from "@/lib/auth/session";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  capability?: string;
  badge?: number;
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "",
    items: [{ href: "/admin", label: "Home", icon: "home" }],
  },
  {
    title: "Selling",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "orders", capability: "orders" },
      { href: "/admin/analytics", label: "Analytics", icon: "chart", capability: "analytics" },
      { href: "/admin/reviews", label: "Reviews", icon: "star", capability: "content" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Watches", icon: "watch", capability: "products" },
      { href: "/admin/straps", label: "Straps", icon: "strap", capability: "straps" },
      { href: "/admin/collections", label: "Collections", icon: "grid", capability: "products" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/content", label: "Sections", icon: "layout", capability: "content" },
      { href: "/admin/policies", label: "Policies", icon: "doc", capability: "content" },
      { href: "/admin/media", label: "Images", icon: "image", capability: "content" },
    ],
  },
  {
    title: "Shop",
    items: [
      { href: "/admin/settings", label: "Settings", icon: "cog", capability: "settings" },
      { href: "/admin/team", label: "Team", icon: "people", capability: "team" },
    ],
  },
];

/** Single-path icons keep the sidebar from pulling in an icon package. */
const PATHS: Record<string, string> = {
  home: "M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  orders: "M6 2h9l5 5v15H6zM15 2v5h5M9 12h8M9 16h8",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  watch: "M9 2h6v3.2a7 7 0 0 1 0 13.6V22H9v-3.2a7 7 0 0 1 0-13.6zM12 9v3l2 1",
  strap: "M8 2h8v6H8zM8 16h8v6H8zM7 8h10v8H7z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  layout: "M3 3h18v18H3zM3 9h18M9 9v12",
  doc: "M6 2h8l4 4v16H6zM14 2v4h4M9 12h6M9 16h6",
  image: "M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6",
  cog: "M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
  star: "m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px] shrink-0"
      aria-hidden
    >
      <path d={PATHS[name] ?? PATHS.home} />
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav({
  role,
  capabilities,
  pendingOrders = 0,
  lowStock = 0,
}: {
  role: Role;
  capabilities: readonly string[];
  pendingOrders?: number;
  lowStock?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const badge = (href: string) =>
    href === "/admin/orders" ? pendingOrders : href === "/admin/products" ? lowStock : 0;

  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.capability || capabilities.includes(i.capability)),
  })).filter((g) => g.items.length);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-line)] bg-white lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth="2" fill="none">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-[236px] flex-col border-r border-[var(--admin-line)] bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <a href="/admin" className="flex h-14 items-center gap-2.5 border-b border-[var(--admin-line-soft)] px-5">
          {/* The real WTC mark, the same file the shop's header uses. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/api/media/brand/logo.png"
            alt="WTC"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg bg-[#09090a] object-cover"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[13px] font-bold tracking-[0.16em] text-[var(--admin-text)]">WTC</span>
            <span className="text-[11px] text-[var(--admin-mute-2)]">Dashboard</span>
          </span>
        </a>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title || "top"} className="mb-4">
              {group.title && (
                <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--admin-mute-2)]">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const count = badge(item.href);
                  return (
                    <li key={item.href}>
                      <Link prefetch={false}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                          active
                            ? "bg-[var(--admin-text)] text-white"
                            : "text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] hover:text-[var(--admin-text)]",
                        )}
                      >
                        <Icon name={item.icon} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {count > 0 && (
                          <span
                            className={cx(
                              "tnum rounded-full px-1.5 py-px text-[11px] font-semibold",
                              active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600",
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--admin-line-soft)] px-5 py-3 text-[11.5px] text-[var(--admin-mute-2)]">
          Signed in as {role}
        </div>
      </aside>
    </>
  );
}
