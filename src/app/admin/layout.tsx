import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard — WTC", template: "%s — WTC Dashboard" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]">{children}</div>;
}
