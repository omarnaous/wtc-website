import { AVAILABILITY_LABEL } from "@/lib/products/constants";
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
  // "In stock" is what a shop is expected to be; only the exceptions get a tag.
  if (availability === "in-stock") return null;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] bg-ink/70",
        TONE[availability],
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {AVAILABILITY_LABEL[availability]}
    </span>
  );
}
