import type { Field } from "./schema";

/**
 * Turns a submitted form back into the JSON shape a section stores.
 *
 * List fields arrive flattened as `key.0.field`, with a `key__count` alongside
 * them; rows where every column is blank are dropped rather than saved as
 * empty objects.
 */
export function parseFields(data: FormData, fields: Field[], prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const field of fields) {
    // Bound fields are applied separately, against whatever they actually
    // edit; storing them here too would make a second copy that can drift.
    if (field.binding) continue;

    const name = prefix + field.key;

    switch (field.type) {
      case "toggle":
        out[field.key] = String(data.get(name) ?? "") === "1";
        break;

      case "number": {
        const raw = String(data.get(name) ?? "").trim();
        if (raw === "") break;
        const n = Number(raw);
        if (!Number.isFinite(n)) break;
        out[field.key] = clamp(n, field.min, field.max);
        break;
      }

      // One hidden field of comma-separated slugs, stored in the same
      // `[{ slug }]` shape the free-text list used — so switching the hero to
      // a picker did not need the rows already in the database rewritten.
      case "products": {
        const slugs = String(data.get(name) ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const seen = new Set<string>();
        const rows = slugs
          .filter((slug) => !seen.has(slug) && seen.add(slug))
          .map((slug) => ({ slug }));
        out[field.key] = field.max ? rows.slice(0, field.max) : rows;
        break;
      }

      case "list": {
        const count = Number(data.get(`${name}__count`) ?? 0);
        const rows: Record<string, string>[] = [];
        for (let i = 0; i < count; i++) {
          const row: Record<string, string> = {};
          let filled = false;
          for (const sub of field.item ?? []) {
            const value = String(data.get(`${name}.${i}.${sub.key}`) ?? "").trim();
            row[sub.key] = value;
            if (value) filled = true;
          }
          if (filled) rows.push(row);
        }
        out[field.key] = field.max ? rows.slice(0, field.max) : rows;
        break;
      }

      default:
        out[field.key] = String(data.get(name) ?? "").trim();
    }
  }

  return out;
}

function clamp(n: number, min?: number, max?: number) {
  if (min != null && n < min) return min;
  if (max != null && n > max) return max;
  return n;
}

/** Paragraph blocks from a textarea — blank lines separate them. */
export function parseParagraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+$/g, "").trim())
    .filter(Boolean);
}
