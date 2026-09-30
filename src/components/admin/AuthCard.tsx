import type { ReactNode } from "react";

/** The centred panel behind sign-in and first-run setup. */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <p className="font-display text-[15px] font-bold tracking-[0.18em] text-[var(--admin-gold)]">
            WTC
          </p>
          <h1 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.01em]">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-[var(--admin-mute)]">
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-[var(--admin-line)] bg-white p-6 shadow-[0_1px_2px_rgba(16,17,26,0.06)]">
          {children}
        </div>
        {footer && (
          <div className="mt-5 text-center text-[12.5px] text-[var(--admin-mute)]">{footer}</div>
        )}
      </div>
    </div>
  );
}
