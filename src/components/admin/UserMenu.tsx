"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/admin/auth-actions";
import { cx } from "./ui";

export default function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-[var(--admin-line)] bg-white py-1 pl-1 pr-2.5 text-[13px] transition-colors hover:bg-[var(--admin-line-soft)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--admin-text)] text-[11px] font-semibold text-white">
          {initials || "?"}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">{name}</span>
        <svg viewBox="0 0 24 24" className="h-3 w-3" stroke="currentColor" strokeWidth="2.4" fill="none">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        role="menu"
        className={cx(
          "absolute right-0 z-50 mt-1.5 w-[220px] rounded-xl border border-[var(--admin-line)] bg-white p-1.5 shadow-lg",
          open ? "block" : "hidden",
        )}
      >
        <div className="px-2.5 py-2">
          <p className="truncate text-[13px] font-medium">{name}</p>
          <p className="truncate text-[12px] text-[var(--admin-mute)]">{email}</p>
        </div>
        <div className="my-1 h-px bg-[var(--admin-line-soft)]" />
        <Link
          href="/admin/account"
          onClick={() => setOpen(false)}
          className="block rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-[var(--admin-line-soft)]"
        >
          Your account
        </Link>
        <Link
          href="/"
          target="_blank"
          onClick={() => setOpen(false)}
          className="block rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-[var(--admin-line-soft)]"
        >
          View the shop ↗
        </Link>
        <div className="my-1 h-px bg-[var(--admin-line-soft)]" />
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
