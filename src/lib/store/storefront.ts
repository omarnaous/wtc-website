/**
 * The storefront's reads of the slow-moving tables — settings, page copy,
 * collections, reviews, policies — kept for half a minute per Worker isolate
 * (see memo.ts).
 *
 * Every page read four or five of these one after another, each a round trip
 * to D1, which is most of why a page took 350–650 ms to start arriving while
 * the Worker itself spent ~3 ms on it. The dashboard keeps importing the
 * originals, so an edit there always shows there at once; on the shop it
 * shows within the TTL.
 */
import { memo } from "./memo";
import { getSettings as freshSettings, getSetting as freshSetting } from "./settings";
import { getSection as freshSection, getSections as freshSections } from "./content";
import { listCollections as freshCollections } from "./collections";
import { listReviews as freshReviews, reviewSummary as freshSummary } from "./reviews";
import { getPolicy as freshPolicy, listPolicies as freshPolicies } from "./policies";

export { str, num, flag, list, type Section } from "./content";

const TTL = 30_000;

export const getSettings = () => memo("settings", TTL, freshSettings);
export const getSetting = <T>(key: string, fallback: T) =>
  memo(`setting:${key}`, TTL, () => freshSetting<T>(key, fallback));
export const getSection = (key: string) => memo(`section:${key}`, TTL, () => freshSection(key));
export const getSections = (keys: string[]) =>
  memo(`sections:${[...keys].sort().join(",")}`, TTL, () => freshSections(keys));
export const listCollections = () => memo("collections", TTL, () => freshCollections());
export const listReviews = () => memo("reviews", TTL, () => freshReviews());
export const reviewSummary = () => memo("review-summary", TTL, freshSummary);
export const listPolicies = () => memo("policies", TTL, () => freshPolicies());
export const getPolicy = (slug: string) => memo(`policy:${slug}`, TTL, () => freshPolicy(slug));
