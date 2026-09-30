import { str } from "@/lib/store/content";
import type { Section } from "@/lib/store/content";
import type { StudioLabels } from "@/components/strap/StrapStudio";

/**
 * Pulls the Strap Studio's labels out of its section row.
 *
 * Both the homepage and every product page mount the studio, so the mapping
 * lives here rather than being written out twice. Empty strings are dropped so
 * the component's own defaults show through.
 */
export function studioLabels(section: Section): Partial<StudioLabels> {
  const keys: (keyof StudioLabels)[] = [
    "watchPickerLabel",
    "strapsLabel",
    "bagLabel",
    "addedLabel2",
    "soldOutLabel",
    "note",
  ];

  const out: Partial<StudioLabels> = {};
  for (const key of keys) {
    const value = str(section, key);
    if (value) out[key] = value;
  }
  return out;
}
