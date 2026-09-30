"use client";

import { MotionConfig } from "framer-motion";

/**
 * Framer Motion drives transforms from JavaScript, so the
 * `prefers-reduced-motion` block in globals.css cannot reach it. This makes
 * every motion component on the site honour the OS setting instead.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
