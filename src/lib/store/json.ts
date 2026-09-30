/** Parsing a stored JSON column must never take a page down. */
export function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export const bool = (v: unknown) => v === 1 || v === true || v === "1";
