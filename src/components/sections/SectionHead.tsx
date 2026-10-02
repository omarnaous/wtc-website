export default function SectionHead({
  eyebrow,
  title,
  accent,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  copy?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="reveal-left max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          {title}
          {accent && <span className="font-serif font-normal italic text-gold-soft"> {accent}</span>}
        </h2>
        {copy && <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute">{copy}</p>}
      </div>
      {children}
    </div>
  );
}
