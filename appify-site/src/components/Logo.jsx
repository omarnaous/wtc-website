import { MARK, WORDMARK } from "../brand.js";

export function Wordmark({ height = 28, color = "currentColor", spark = "var(--iris)", className }) {
  return (
    <svg className={className} viewBox={WORDMARK.viewBox} height={height} role="img" aria-label="Appify">
      <path d={WORDMARK.letters} fill={color} />
      <path d={WORDMARK.spark} fill={spark} />
    </svg>
  );
}

export function Mark({ size = 32, color = "currentColor", spark = "var(--iris)", className }) {
  return (
    <svg className={className} viewBox={MARK.viewBox} height={size} role="img" aria-label="Appify">
      <path d={`${MARK.ring} ${MARK.stem}`} fill={color} />
      <path d={MARK.spark} fill={spark} />
    </svg>
  );
}
