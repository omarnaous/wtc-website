import { AVAILABILITY_LABEL } from "@/data/products";
import type { Availability } from "@/data/types";
import { cx } from "@/lib/format";

const TONE: Record<Availability, string> = {
  "in-stock": "border-emerald-500/30 text-emerald-300/90",
  "low-stock": "border-amber-500/35 text-amber-300/90",
  "pre-order": "border-sky-500/30 text-sky-300/90",
  "sold-out": "border-line text-mute-2",
};

export default function Badge({
  availability,
  className,
}: {
  availability: Availability;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em]",
        TONE[availability],
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {AVAILABILITY_LABEL[availability]}
    </span>
  );
}
