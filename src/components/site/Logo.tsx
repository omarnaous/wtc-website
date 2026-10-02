import Image from "next/image";
import { cx } from "@/lib/format";
import { asset } from "@/lib/asset";

/**
 * The WTC mark: the uploaded logo when there is one, and a minimal watch face
 * with its hands at ten-past-ten when there is not. Both come from Settings.
 */
export default function Logo({
  className,
  withWordmark = true,
  logo,
  name = "WTC",
  tagline = "Your Watch Insider",
}: {
  className?: string;
  withWordmark?: boolean;
  logo?: string;
  name?: string;
  tagline?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      {logo ? (
        <Image
          src={asset(logo)}
          alt=""
          width={64}
          height={64}
          // The profile picture is a square with the mark inset; a circular
          // crop would clip the tagline off its edges.
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
      <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" aria-hidden="true">
        <circle cx="20" cy="20" r="19" className="fill-ink stroke-line" strokeWidth="1" />
        <circle cx="20" cy="20" r="14.5" className="stroke-mute-2" strokeWidth="0.75" fill="none" />
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="20"
            y1="7.5"
            x2="20"
            y2="10"
            className="stroke-chalk"
            strokeWidth="1.1"
            strokeLinecap="round"
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
        <line x1="20" y1="20" x2="13.5" y2="14" className="stroke-chalk" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="20" y1="20" x2="27" y2="14.5" className="stroke-chalk" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="20" y1="20" x2="20" y2="27" className="stroke-gold" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="20" cy="20" r="1.3" className="fill-gold" />
      </svg>
      )}
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-[0.18em] text-chalk">
            {name}
          </span>
          {tagline && (
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-mute-2">
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
