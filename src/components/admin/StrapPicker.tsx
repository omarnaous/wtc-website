"use client";

import { useActionState, useMemo, useState } from "react";
import { saveProductStraps, type State } from "@/app/admin/(dash)/products/actions";
import { Button, Card, INPUT, Notice, cx, money } from "./ui";
import { SaveBar } from "./fields";

export interface StrapChoice {
  sku: string;
  name: string;
  type: string;
  price: number;
  color: string;
  image: string;
  /** Photograph of this strap fitted to this watch, when one has been shot. */
  photo?: string;
  chip?: string;
}

export interface FittedStrap extends StrapChoice {
  priceOverride?: number | null;
}

/**
 * Which straps the Strap Studio offers on one watch, and in what order.
 *
 * The list is held in component state and submitted as one JSON field, so
 * reordering and removing rows never hits the server until Save.
 */
export default function StrapPicker({
  slug,
  fitted,
  catalogue,
  defaultSku,
}: {
  slug: string;
  fitted: FittedStrap[];
  catalogue: StrapChoice[];
  defaultSku?: string;
}) {
  const [rows, setRows] = useState<FittedStrap[]>(fitted);
  const [primary, setPrimary] = useState(defaultSku ?? fitted[0]?.sku ?? "");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [state, action] = useActionState<State, FormData>(saveProductStraps, {});

  const chosen = new Set(rows.map((r) => r.sku));
  const available = useMemo(
    () =>
      catalogue
        .filter((s) => !chosen.has(s.sku))
        .filter((s) => !query || `${s.name} ${s.sku}`.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 48),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalogue, query, rows],
  );

  const touch = () => setDirty(true);

  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    touch();
  };

  const payload = JSON.stringify(
    rows.map((r) => ({ sku: r.sku, photo: r.photo, chip: r.chip, price: r.priceOverride ?? null })),
  );

  return (
    <form action={action} onSubmit={() => setDirty(false)}>
      <input type="hidden" name="__slug" value={slug} />
      <input type="hidden" name="straps" value={payload} />
      <input type="hidden" name="defaultStrap" value={primary} />

      <Card
        title="Straps in the studio"
        description={`${rows.length} strap${rows.length === 1 ? "" : "s"} offered on this watch. The first one is what the studio opens on.`}
        actions={
          <Button type="button" onClick={() => setAdding((v) => !v)} className="!py-1.5 !text-[12px]">
            {adding ? "Close" : "Add straps"}
          </Button>
        }
      >
        {state.error && (
          <div className="mb-4">
            <Notice tone="error">{state.error}</Notice>
          </div>
        )}
        {state.ok && !dirty && (
          <div className="mb-4">
            <Notice tone="success">{state.ok}</Notice>
          </div>
        )}

        {adding && (
          <div className="mb-5 rounded-lg border border-[var(--admin-line)] p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the strap catalogue…"
              className={cx(INPUT, "mb-3")}
            />
            {available.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-[var(--admin-mute)]">
                {chosen.size === catalogue.length
                  ? "Every strap is already on this watch."
                  : "Nothing matches that."}
              </p>
            ) : (
              <div className="grid max-h-[260px] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {available.map((s) => (
                  <button
                    key={s.sku}
                    type="button"
                    onClick={() => {
                      setRows((prev) => [...prev, { ...s }]);
                      if (!primary) setPrimary(s.sku);
                      touch();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[var(--admin-line)] p-2 text-left transition-colors hover:border-[var(--admin-text)]"
                  >
                    <span
                      className="h-7 w-7 shrink-0 rounded-md border border-[var(--admin-line)]"
                      style={{ background: s.color }}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium">{s.name}</span>
                      <span className="block truncate text-[11px] text-[var(--admin-mute)]">
                        {s.sku}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--admin-line)] px-4 py-8 text-center text-[13px] text-[var(--admin-mute)]">
            No straps on this watch yet, so the Strap Studio is hidden on its page.
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map((s, i) => (
              <li
                key={s.sku}
                className={cx(
                  "flex flex-wrap items-center gap-3 rounded-lg border p-2.5",
                  primary === s.sku ? "border-[var(--admin-text)]" : "border-[var(--admin-line)]",
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-line)] bg-[var(--admin-line-soft)]">
                  {s.chip || s.photo || s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.chip || s.photo || s.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="h-full w-full" style={{ background: s.color }} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{s.name}</span>
                  <span className="block truncate text-[11.5px] text-[var(--admin-mute)]">
                    {s.sku} · {money(s.priceOverride ?? s.price)}
                    {s.priceOverride != null && " (override)"}
                    {!s.photo && " · no fitted photo"}
                  </span>
                </span>

                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPrimary(s.sku);
                      touch();
                    }}
                    className={cx(
                      "rounded-md px-2 py-1 text-[11.5px]",
                      primary === s.sku
                        ? "bg-[var(--admin-text)] text-white"
                        : "text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)]",
                    )}
                  >
                    {primary === s.sku ? "Opens on this" : "Make first"}
                  </button>
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-md px-1.5 py-1 text-[var(--admin-mute-2)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    className="rounded-md px-1.5 py-1 text-[var(--admin-mute-2)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${s.name}`}
                    onClick={() => {
                      setRows((prev) => prev.filter((r) => r.sku !== s.sku));
                      if (primary === s.sku) setPrimary("");
                      touch();
                    }}
                    className="rounded-md px-1.5 py-1 text-[var(--admin-mute-2)] hover:bg-red-50 hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <SaveBar dirty={dirty} />
    </form>
  );
}
