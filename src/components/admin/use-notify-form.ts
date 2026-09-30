"use client";

import { useEffect, useRef } from "react";

/**
 * Tells the surrounding EditorForm that something changed.
 *
 * The save bar appears on the form's `change`/`input` events, which only fire
 * for typing and toggling. A field whose state moves on a button — reordering
 * a row, removing one, picking a watch — would otherwise change nothing the
 * form can see, and its Save button would never appear. Re-emitting `input`
 * from a node inside the form puts those edits back on the same channel.
 *
 * Skips the first run: a field is not dirty for having mounted.
 */
export function useNotifyForm(dep: unknown) {
  const anchor = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    anchor.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [dep]);
  return anchor;
}
