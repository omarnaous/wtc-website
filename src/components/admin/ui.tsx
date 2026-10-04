import Link from "next/link";
import type { ReactNode } from "react";

/** Shared chrome for the dashboard. Deliberately plain: forms, tables, rules. */

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link prefetch={false}
            href={back.href}
            className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-[var(--admin-mute)] hover:text-[var(--admin-text)]"
          >
            <span aria-hidden>←</span> {back.label}
          </Link>
        )}
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.01em]">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--admin-mute)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-xl border border-[var(--admin-line)] bg-[var(--admin-panel)] shadow-[0_1px_2px_rgba(16,17,26,0.05)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-line-soft)] px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-[14px] font-semibold">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-[12.5px] text-[var(--admin-mute)]">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName ?? "p-5"}>{children}</div>
    </section>
  );
}

/**
 * A card that starts closed.
 *
 * For the parts of a form that have a sensible answer already and only
 * sometimes need one of their own — the colour sampling on a watch, say. A
 * long form is not made shorter by deleting fields people occasionally need;
 * it is made shorter by not showing them until they are asked for.
 *
 * `<details>` rather than state, so the fields inside are still in the form
 * and still submitted while it is shut.
 */
export function FoldCard({
  title,
  description,
  children,
  open = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group rounded-xl border border-[var(--admin-line)] bg-[var(--admin-panel)] shadow-[0_1px_2px_rgba(16,17,26,0.05)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold">{title}</span>
          {description && (
            <span className="mt-0.5 block text-[12.5px] text-[var(--admin-mute)]">
              {description}
            </span>
          )}
        </span>
        <span className="shrink-0 text-[12px] text-[var(--admin-mute)] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-[var(--admin-line-soft)] p-5">{children}</div>
    </details>
  );
}

type Tone = "default" | "primary" | "danger" | "ghost";

const TONES: Record<Tone, string> = {
  default:
    "border-[var(--admin-line)] bg-white text-[var(--admin-text)] hover:bg-[var(--admin-line-soft)]",
  primary:
    "border-transparent bg-[var(--admin-accent)] text-white hover:opacity-90 disabled:opacity-50",
  danger: "border-red-200 bg-white text-red-600 hover:bg-red-50",
  ghost: "border-transparent bg-transparent text-[var(--admin-mute)] hover:text-[var(--admin-text)]",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  tone = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return <button {...props} className={cx(BUTTON_BASE, TONES[tone], className)} />;
}

export function LinkButton({
  tone = "default",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { tone?: Tone }) {
  return <Link prefetch={false} {...props} className={cx(BUTTON_BASE, TONES[tone], className)} />;
}

export const INPUT =
  "w-full rounded-lg border border-[var(--admin-line)] bg-white px-3 py-2 text-[13.5px] text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-mute-2)] focus:border-[var(--admin-text)] focus:ring-2 focus:ring-black/5";

export function Label({
  children,
  help,
  htmlFor,
}: {
  children: ReactNode;
  help?: string;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-[12.5px] font-medium">
        {children}
      </label>
      {help && <p className="mt-0.5 text-[12px] leading-snug text-[var(--admin-mute)]">{help}</p>}
    </div>
  );
}

export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--admin-line)] px-6 py-14 text-center">
      <p className="text-[14px] font-medium">{title}</p>
      {children && (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--admin-mute)]">
          {children}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const PILL_TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/15",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  grey: "bg-zinc-100 text-zinc-600 ring-zinc-500/15",
};

export function Pill({ tone = "grey", children }: { tone?: string; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset",
        PILL_TONES[tone] ?? PILL_TONES.grey,
      )}
    >
      {children}
    </span>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error" | "success";
  children: ReactNode;
}) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  } as const;
  return (
    <div className={cx("rounded-lg border px-4 py-3 text-[13px] leading-relaxed", tones[tone])}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-[var(--admin-line)] bg-[var(--admin-panel)] px-5 py-4">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--admin-mute)]">
        {label}
      </p>
      <p className="tnum mt-2 font-display text-[26px] font-semibold leading-none tracking-[-0.02em]">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[12px]">
        {delta != null && Number.isFinite(delta) && (
          <span className={up ? "text-emerald-600" : "text-red-600"}>
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}%
          </span>
        )}
        {sub && <span className="text-[var(--admin-mute)]">{sub}</span>}
      </div>
    </div>
  );
}

export const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function shortDate(iso: string) {
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function dateTime(iso: string) {
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
