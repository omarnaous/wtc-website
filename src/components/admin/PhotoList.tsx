"use client";

import { useState } from "react";
import { ImageField, type UploadedImage } from "./fields";
import { useNotifyForm } from "./use-notify-form";
import { Button, Label, cx } from "./ui";

/**
 * A watch's photographs, in the order they are shown.
 *
 * Three named slots — front, angle, side — asked every watch the same question
 * and got the wrong answer twice: a piece with one usable shot had two empty
 * boxes, and a piece worth photographing from five angles had nowhere to put
 * the other two. This is a list instead. The first photograph is the one that
 * leads: the card, the catalogue, the films and the bag all take it.
 *
 * Each row submits as `photo0`…`photo{max-1}`, which is all the server needs
 * to rebuild the list in order.
 */
export default function PhotoList({
  name = "photo",
  value,
  max = 5,
  uploads = [],
}: {
  name?: string;
  value: string[];
  max?: number;
  uploads?: UploadedImage[];
}) {
  const [photos, setPhotos] = useState<string[]>(value.length ? value.slice(0, max) : [""]);
  const anchor = useNotifyForm(photos.join("|"));

  const set = (i: number, v: string) =>
    setPhotos((prev) => prev.map((p, pi) => (pi === i ? v : p)));

  const move = (from: number, to: number) =>
    setPhotos((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });

  const remove = (i: number) =>
    setPhotos((prev) => (prev.length === 1 ? [""] : prev.filter((_, pi) => pi !== i)));

  return (
    <div>
      <Label help={`Up to ${max}. The first one leads everywhere — cards, the catalogue and the bag.`}>
        Photographs
      </Label>

      {/* Fixed number of names so removing the last row clears its slot on the
          server rather than leaving the old path behind. */}
      <input ref={anchor} type="hidden" name={`${name}__count`} value={photos.length} />
      {Array.from({ length: max }, (_, i) => (
        <input key={`h${i}`} type="hidden" name={`${name}${i}`} value={photos[i] ?? ""} />
      ))}

      <ol className="space-y-2">
        {photos.map((src, i) => (
          <li
            key={i}
            className={cx(
              "flex items-start gap-2 rounded-lg border bg-white p-2.5",
              i === 0 ? "border-[var(--admin-gold)]" : "border-[var(--admin-line)]",
            )}
          >
            <span className="mt-4 w-14 shrink-0 text-center text-[11px] text-[var(--admin-mute-2)]">
              {i === 0 ? (
                <span className="font-medium text-[var(--admin-gold)]">Main</span>
              ) : (
                i + 1
              )}
            </span>

            <span className="min-w-0 flex-1">
              <ImageField
                name={`${name}__row${i}`}
                value={src}
                onChange={(v) => set(i, v)}
                uploads={uploads}
              />
            </span>

            <span className="mt-3 flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`Move photograph ${i + 1} up`}
                className="rounded-md px-1.5 py-1 text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === photos.length - 1}
                aria-label={`Move photograph ${i + 1} down`}
                className="rounded-md px-1.5 py-1 text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove photograph ${i + 1}`}
                className="rounded-md px-1.5 py-1 text-[var(--admin-mute-2)] hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ol>

      {photos.length < max && (
        <Button
          type="button"
          onClick={() => setPhotos((prev) => [...prev, ""])}
          className="mt-2 !py-1.5 !text-[12px]"
        >
          + Add a photograph
        </Button>
      )}
    </div>
  );
}
