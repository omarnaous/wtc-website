"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { saveInventory, type State } from "@/app/admin/(dash)/inventory/actions";
import { SaveBar } from "./fields";
import { Card, INPUT, Notice, Pill, cx, money } from "./ui";

export interface SheetRow {
  kind: "watch" | "strap";
  /** Slug for a watch, SKU for a strap. */
  ref: string;
  name: string;
  detail: string;
  image: string;
  /** The full editor for this item. */
  href: string;
  price: number;
  status: string;
  collectionId?: string;
  /** null means stock is not counted for this item. */
  stock: number | null;
}

export interface SheetCollection {
  id: string;
  name: string;
}

const STATUS_TONE: Record<string, string> = { active: "green", draft: "amber", archived: "grey" };

/**
 * The catalogue and its stock, in one table.
 *
 * Stock used to be four columns — track, on hand, reserved, low-at — and a
 * separate page to find them on. It is one column now, and one number: how
 * many are left to sell. Orders move it down as they are placed and back up if
 * they are cancelled, so it is not a figure anyone has to keep in step by
 * hand; typing in it is for when the shelf and the screen disagree.
 *
 * Leaving the box empty means the count is off for that item and the badge on
 * the site is whatever the watch's own Availability says — which is where a
 * pre-order or a one-off belongs.
 *
 * Everything is held locally until Save, so counting a shelf and moving three
 * watches into a collection is one pass and one write rather than a request
 * per keystroke.
 */
export default function CatalogueSheet({
  rows: initial,
  collections,
  emptyLabel = "Nothing matches that.",
}: {
  rows: SheetRow[];
  /** Given for watches; enables the collection column, tabs and bulk move. */
  collections?: SheetCollection[];
  emptyLabel?: string;
}) {
  const [rows, setRows] = useState(initial);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [state, action] = useActionState<State, FormData>(saveInventory, {});

  const key = (r: SheetRow) => `${r.kind}:${r.ref}`;

  const update = (k: string, patch: Partial<SheetRow>) => {
    setRows((prev) => prev.map((r) => (key(r) === k ? { ...r, ...patch } : r)));
    setDirty((prev) => new Set(prev).add(k));
  };

  const shown = useMemo(
    () =>
      rows.filter((r) => {
        if (tab === "low" ? !(r.stock !== null && r.stock <= 2) : false) return false;
        if (tab !== "all" && tab !== "low" && r.collectionId !== tab) return false;
        if (status !== "all" && r.status !== status) return false;
        if (query && !`${r.name} ${r.ref} ${r.detail}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [rows, query, tab, status],
  );

  const changed = rows.filter((r) => dirty.has(key(r)));
  const payload = JSON.stringify(
    changed.map((r) => ({
      kind: r.kind,
      ref: r.ref,
      // An empty box is "do not count this one", which is what track carries.
      track: r.stock !== null,
      onHand: r.stock ?? 0,
      ...(r.collectionId === undefined ? {} : { collectionId: r.collectionId }),
    })),
  );

  const counted = rows.filter((r) => r.stock !== null);
  const units = counted.reduce((n, r) => n + (r.stock ?? 0), 0);

  /** Moves every ticked row into one collection. */
  const movePicked = (to: string) => {
    if (!to) return;
    setRows((prev) =>
      prev.map((r) => (picked.has(key(r)) ? { ...r, collectionId: to } : r)),
    );
    setDirty((prev) => new Set([...prev, ...picked]));
    setPicked(new Set());
  };

  const togglePick = (k: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const allShownPicked = shown.length > 0 && shown.every((r) => picked.has(key(r)));

  return (
    <form action={action} onSubmit={() => setDirty(new Set())}>
      <input type="hidden" name="rows" value={payload} />

      {state.error && (
        <div className="mb-4">
          <Notice tone="error">{state.error}</Notice>
        </div>
      )}
      {state.ok && dirty.size === 0 && (
        <div className="mb-4">
          <Notice tone="success">{state.ok}</Notice>
        </div>
      )}

      {/* ── Collection tabs ───────────────────────────────────────────────── */}
      {collections && collections.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-[var(--admin-line)]">
          {[
            { id: "all", name: "All watches" },
            ...collections,
            // Only offered once something is actually unfiled — taken out of a
            // collection but still in the catalogue.
            ...(rows.some((r) => r.kind === "watch" && r.collectionId === "")
              ? [{ id: "", name: "Unfiled" }]
              : []),
          ].map((c) => {
            const n =
              c.id === "all" ? rows.length : rows.filter((r) => r.collectionId === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab(c.id)}
                className={cx(
                  "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
                  tab === c.id
                    ? "border-[var(--admin-text)] text-[var(--admin-text)]"
                    : "border-transparent text-[var(--admin-mute)] hover:text-[var(--admin-text)]",
                )}
              >
                {c.name}
                <span className="ml-1.5 text-[11.5px] text-[var(--admin-mute-2)]">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, reference or colour…"
          aria-label="Search the catalogue"
          className={cx(INPUT, "h-9 max-w-[260px] flex-1 !py-1.5")}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className={cx(INPUT, "h-9 w-auto !py-1.5")}
        >
          <option value="all">Any status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button
          type="button"
          onClick={() => setTab(tab === "low" ? "all" : "low")}
          className={cx(
            "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            tab === "low"
              ? "border-[var(--admin-text)] bg-[var(--admin-text)] text-white"
              : "border-[var(--admin-line)] bg-white text-[var(--admin-mute)] hover:text-[var(--admin-text)]",
          )}
        >
          Running low
        </button>
        <span className="ml-auto text-[12.5px] text-[var(--admin-mute)]">
          {shown.length} shown · {units} in stock
        </span>
      </div>

      {/* ── Bulk move ─────────────────────────────────────────────────────── */}
      {collections && picked.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--admin-line)] bg-[var(--admin-line-soft)]/60 px-3 py-2">
          <span className="text-[12.5px] font-medium">
            {picked.size} selected
          </span>
          <span className="text-[12.5px] text-[var(--admin-mute)]">Move to</span>
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => movePicked(c.id)}
              className="rounded-md border border-[var(--admin-line)] bg-white px-2.5 py-1 text-[12.5px] font-medium hover:border-[var(--admin-mute-2)]"
            >
              {c.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPicked(new Set())}
            className="ml-auto text-[12.5px] text-[var(--admin-mute)] hover:text-[var(--admin-text)]"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── The sheet ─────────────────────────────────────────────────────── */}
      <Card bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[13px]">
            <thead className="border-b border-[var(--admin-line-soft)] text-[11.5px] uppercase tracking-[0.06em] text-[var(--admin-mute-2)]">
              <tr>
                {collections && (
                  <th className="w-9 py-2.5 pl-5 pr-0">
                    <input
                      type="checkbox"
                      checked={allShownPicked}
                      aria-label="Select every row shown"
                      onChange={() =>
                        setPicked(allShownPicked ? new Set() : new Set(shown.map(key)))
                      }
                      className="h-4 w-4 accent-zinc-900"
                    />
                  </th>
                )}
                <th className={cx("py-2.5 pr-3 font-medium", collections ? "pl-3" : "pl-5")}>
                  Item
                </th>
                {collections && <th className="px-3 py-2.5 font-medium">Collection</th>}
                <th className="px-3 py-2.5 text-right font-medium">In stock</th>
                <th className="px-3 py-2.5 text-right font-medium">Price</th>
                <th className="py-2.5 pl-3 pr-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-line-soft)]">
              {shown.map((r) => {
                const k = key(r);
                return (
                  <tr key={k} className={cx("group", dirty.has(k) && "bg-amber-50/60")}>
                    {collections && (
                      <td className="py-2 pl-5 pr-0">
                        <input
                          type="checkbox"
                          checked={picked.has(k)}
                          aria-label={`Select ${r.name}`}
                          onChange={() => togglePick(k)}
                          className="h-4 w-4 accent-zinc-900"
                        />
                      </td>
                    )}

                    <td className={cx("py-2 pr-3", collections ? "pl-3" : "pl-5")}>
                      <Link href={r.href} className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-line)] bg-[var(--admin-line-soft)]">
                          {r.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.image} alt="" className="h-full w-full object-contain p-0.5" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium group-hover:underline">
                            {r.name}
                          </span>
                          <span className="block truncate text-[11.5px] text-[var(--admin-mute)]">
                            {r.detail}
                          </span>
                        </span>
                      </Link>
                    </td>

                    {collections && (
                      <td className="px-3 py-2">
                        {r.kind === "watch" ? (
                          <select
                            value={r.collectionId ?? ""}
                            aria-label={`Collection for ${r.name}`}
                            onChange={(e) => update(k, { collectionId: e.target.value })}
                            className={cx(
                              "w-full min-w-[9rem] rounded-md border bg-white px-2 py-1 text-[12.5px]",
                              r.collectionId
                                ? "border-[var(--admin-line)]"
                                : "border-amber-300 text-amber-700",
                            )}
                          >
                            <option value="">Unfiled</option>
                            {collections.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[var(--admin-mute-2)]">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-3 py-2 text-right">
                      <span className="inline-flex items-center gap-2">
                        {r.stock !== null && r.stock <= 0 && <Pill tone="red">Sold out</Pill>}
                        <input
                          type="number"
                          min={0}
                          value={r.stock ?? ""}
                          placeholder="Not counted"
                          aria-label={`Units of ${r.name} in stock`}
                          onChange={(e) =>
                            update(k, {
                              stock: e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="tnum w-24 rounded-md border border-[var(--admin-line)] px-2 py-1 text-right placeholder:text-[11px] placeholder:text-[var(--admin-mute-2)]"
                        />
                      </span>
                    </td>

                    <td className="tnum px-3 py-2 text-right font-medium">{money(r.price)}</td>
                    <td className="py-2 pl-3 pr-5">
                      <Pill tone={STATUS_TONE[r.status] ?? "grey"}>{r.status}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {shown.length === 0 && (
          <p className="px-5 py-10 text-center text-[13px] text-[var(--admin-mute)]">{emptyLabel}</p>
        )}
      </Card>

      <SaveBar dirty={dirty.size > 0} />
    </form>
  );
}
