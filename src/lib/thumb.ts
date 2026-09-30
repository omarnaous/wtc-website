import map from "@/data/watch-thumbs.json";

const THUMBS: Record<string, string> = map;

/**
 * The 128px version of a watch photograph, where one exists.
 *
 * Images are served unoptimised on both targets, so a component drawing a
 * watch at thumbnail size would otherwise download the full 1080px shot. Only
 * paths `npm run thumbs` actually wrote are substituted — anything else, an
 * uploaded image included, is returned untouched rather than pointed at a file
 * that is not there.
 */
export function thumb(src: string): string {
  return THUMBS[src] ?? src;
}
