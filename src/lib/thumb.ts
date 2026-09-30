import map from "@/data/watch-thumbs.json";
import { asset, BASE_PATH, MEDIA_ORIGIN } from "@/lib/asset";

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
  // The map is keyed by the bare path; asset() may have put an origin or a
  // basePath in front of it.
  let bare = src;
  for (const prefix of [MEDIA_ORIGIN, BASE_PATH]) {
    if (prefix && bare.startsWith(`${prefix}/`)) bare = bare.slice(prefix.length);
  }
  const hit = THUMBS[bare];
  return hit ? (bare === src ? hit : asset(hit)) : src;
}
