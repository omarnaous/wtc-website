import { WORDMARK, MARK, sparkPath } from "../brand.js";

export function Wordmark({ height = 30, color = "currentColor", spark = "var(--uv)", className }) {
  const [x, y, w, h] = WORDMARK.viewBox.split(" ").map(Number);
  return (
    <svg className={className} viewBox={WORDMARK.viewBox} height={height} width={(height * w) / h} aria-label="Appify" role="img">
      <path d={WORDMARK.letters} fill={color} />
      <path className="wm-spark" d={WORDMARK.spark} fill={spark} />
    </svg>
  );
}

export function Spark({ size = 22, color = "var(--uv)", className, style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d={sparkPath(50, 50, 48, 0.22)} fill={color} />
    </svg>
  );
}

// The "a" mark: ring + stem + spark. Strokes draw in when the parent gets the `in` class.
export function Mark({ size = 260 }) {
  return (
    <svg className="mark" viewBox={MARK.viewBox} width={size} height={(size * 362) / 258} aria-label="Appify mark" role="img">
      <path className="mark-ring" d={MARK.ring} fill="var(--ink)" fillRule="evenodd" />
      <path className="mark-stem" d={MARK.stem} fill="var(--ink)" />
      <path className="mark-spark" d={MARK.spark} fill="var(--uv)" />
    </svg>
  );
}

export function Heading({ kicker, children, dark }) {
  return (
    <div className={`heading ${dark ? "dark" : ""}`} data-reveal>
      <div className="kicker"><Spark size={18} className="kick-spark" /> {kicker}</div>
      <h2>{children}</h2>
    </div>
  );
}

export function WhatsAppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}
