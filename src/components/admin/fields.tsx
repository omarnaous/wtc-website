"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, INPUT, Label, Notice, cx } from "./ui";
import ProductPicker, { type PickerProduct } from "./ProductPicker";
import { useNotifyForm } from "./use-notify-form";
import type { Field as FieldDef } from "@/lib/content/schema";

/**
 * Every input the dashboard uses, driven by the field definitions in
 * src/lib/content/schema.ts. Values are submitted as plain form fields named
 * after their key, so a server action can read them straight off FormData.
 */

export function TextField({
  name,
  label,
  help,
  defaultValue,
  value,
  onChange,
  placeholder,
  required,
  prefix,
  type = "text",
}: {
  name: string;
  label: string;
  help?: string;
  defaultValue?: string;
  /** Pass with `onChange` for a field something else writes into. */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  /** A fixed leader inside the box, e.g. "/products/". */
  prefix?: string;
  type?: string;
}) {
  const controlled = value !== undefined;
  return (
    <div>
      <Label htmlFor={name} help={help}>
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--admin-mute-2)]">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          {...(controlled
            ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }
            : { defaultValue })}
          placeholder={placeholder}
          required={required}
          className={cx(INPUT, prefix && "pl-[5.5rem]")}
        />
      </div>
    </div>
  );
}

export function TextArea({
  name,
  label,
  help,
  defaultValue,
  rows = 4,
  placeholder,
}: {
  name: string;
  label: string;
  help?: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} help={help}>
        {label}
      </Label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cx(INPUT, "resize-y leading-relaxed")}
      />
    </div>
  );
}

export function NumberField({
  name,
  label,
  help,
  defaultValue,
  min,
  max,
  step = "any",
  prefix,
}: {
  name: string;
  label: string;
  help?: string;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  step?: string | number;
  prefix?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} help={help}>
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--admin-mute)]">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          // Money fields (a "$" prefix) are typed, never nudged: no spinner.
          className={cx(INPUT, "tnum", prefix && "pl-7", prefix === "$" && "no-spin")}
        />
      </div>
    </div>
  );
}

export function SelectField({
  name,
  label,
  help,
  defaultValue,
  value,
  onChange,
  options,
}: {
  name: string;
  label: string;
  help?: string;
  defaultValue?: string;
  /** Pass with `onChange` when picking here fills in another field. */
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const controlled = value !== undefined;
  return (
    <div>
      <Label htmlFor={name} help={help}>
        {label}
      </Label>
      <select
        id={name}
        name={name}
        {...(controlled
          ? { value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value) }
          : { defaultValue })}
        className={cx(INPUT, "pr-8")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({
  name,
  label,
  help,
  defaultChecked,
}: {
  name: string;
  label: string;
  help?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(Boolean(defaultChecked));
  return (
    <div className="flex items-start gap-3">
      {/* The hidden input is what actually submits — the button is the handle. */}
      <input type="hidden" name={name} value={on ? "1" : "0"} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${name}-label`}
        onClick={() => setOn((v) => !v)}
        className={cx(
          "mt-0.5 h-[22px] w-[38px] shrink-0 rounded-full p-[3px] transition-colors",
          on ? "bg-[var(--admin-text)]" : "bg-zinc-300",
        )}
      >
        <span
          className={cx(
            "block h-4 w-4 rounded-full bg-white transition-transform",
            on && "translate-x-4",
          )}
        />
      </button>
      <div className="min-w-0">
        <label id={`${name}-label`} className="block text-[13px] font-medium">
          {label}
        </label>
        {help && <p className="mt-0.5 text-[12px] leading-snug text-[var(--admin-mute)]">{help}</p>}
      </div>
    </div>
  );
}

export function ColorField({
  name,
  label,
  help,
  defaultValue = "#000000",
}: {
  name: string;
  label: string;
  help?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || "#000000");
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <div>
      <Label htmlFor={name} help={help}>
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} colour picker`}
          value={valid ? value : "#000000"}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-[var(--admin-line)] bg-white p-1"
        />
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cx(INPUT, "tnum")}
          placeholder="#c9a227"
        />
      </div>
    </div>
  );
}

interface ImageGroup {
  label: string;
  dir: string;
  files: { path: string; size: number }[];
}

/** One image uploaded from the dashboard, as the picker needs it. */
export interface UploadedImage {
  key: string;
  filename: string;
}

export function ImageField({
  name,
  label,
  help,
  defaultValue = "",
  value: controlled,
  onChange,
  uploads = [],
}: {
  name: string;
  label?: string;
  help?: string;
  defaultValue?: string;
  /** Pass with `onChange` when the parent owns the value — see PhotoList. */
  value?: string;
  onChange?: (value: string) => void;
  /** Images uploaded from Images, listed first so the newest are to hand. */
  uploads?: UploadedImage[];
}) {
  const [own, setOwn] = useState(defaultValue);
  const value = controlled ?? own;
  const setValue = (v: string) => {
    if (onChange) onChange(v);
    else setOwn(v);
  };
  const [browsing, setBrowsing] = useState(false);
  const [query, setQuery] = useState("");

  // Everything the picker can offer is in R2 now. There is no second group of
  // bundled photography to list behind these — the public/ folder it read is
  // gone, and an image that is not in Images does not exist.
  const all: ImageGroup[] = uploads.length
    ? [
        {
          label: "Images",
          dir: "__uploads",
          files: uploads.map((u) => ({ path: `/api/media/${u.key}`, size: 0 })),
        },
      ]
    : [];

  const groups = all
    .map((g) => ({
      ...g,
      files: query
        ? g.files.filter((f) => f.path.toLowerCase().includes(query.toLowerCase()))
        : g.files,
    }))
    .filter((g) => g.files.length);

  return (
    <div>
      {label && (
        <Label htmlFor={name} help={help}>
          {label}
        </Label>
      )}
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--admin-line)] bg-[var(--admin-line-soft)]"
          aria-hidden
        >
          {value ? (
            // Previewing an arbitrary path the user typed — next/image would
            // need it declared, and this is a 56px thumbnail.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-[var(--admin-mute-2)]">None</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={name}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="/api/media/…"
            className={INPUT}
          />
          <div className="flex gap-2">
            <Button type="button" onClick={() => setBrowsing((v) => !v)} className="!py-1.5 !text-[12px]">
              {browsing ? "Close" : "Browse images"}
            </Button>
            {value && (
              <Button
                type="button"
                tone="ghost"
                onClick={() => setValue("")}
                className="!py-1.5 !text-[12px]"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {browsing && (
        <div className="mt-3 rounded-lg border border-[var(--admin-line)] bg-white p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name…"
            className={cx(INPUT, "mb-3")}
          />
          <div className="max-h-[320px] space-y-4 overflow-y-auto">
            {groups.length === 0 && (
              <p className="py-6 text-center text-[13px] text-[var(--admin-mute)]">
                Nothing matches that.
              </p>
            )}
            {groups.map((g) => (
              <div key={g.dir}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--admin-mute-2)]">
                  {g.label} · {g.files.length}
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {g.files.slice(0, 60).map((f) => (
                    <button
                      key={f.path}
                      type="button"
                      title={f.path}
                      onClick={() => {
                        setValue(f.path);
                        setBrowsing(false);
                      }}
                      className={cx(
                        "aspect-square overflow-hidden rounded-md border bg-[var(--admin-line-soft)] p-1 transition-colors",
                        value === f.path
                          ? "border-[var(--admin-text)]"
                          : "border-[var(--admin-line)] hover:border-[var(--admin-mute)]",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.path} alt="" loading="lazy" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A repeating group of fields — the hero figures, navigation links, spec rows.
 * Rows submit as `key.0.field`, which the server action reassembles.
 */
export function ListField({
  name,
  label,
  help,
  item,
  value,
  addLabel = "Add a row",
  max,
}: {
  name: string;
  label: string;
  help?: string;
  item: FieldDef[];
  value: Record<string, string>[];
  addLabel?: string;
  max?: number;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    value.length ? value : [Object.fromEntries(item.map((f) => [f.key, ""]))],
  );

  const update = (i: number, key: string, v: string) =>
    setRows((prev) => prev.map((r, ri) => (ri === i ? { ...r, [key]: v } : r)));

  const anchor = useNotifyForm(rows.length);

  return (
    <div>
      <Label help={help}>{label}</Label>
      <input ref={anchor} type="hidden" name={`${name}__count`} value={rows.length} />
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-end gap-2 rounded-lg border border-[var(--admin-line)] bg-white p-2.5"
          >
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {item.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[11.5px] text-[var(--admin-mute)]">
                    {f.label}
                  </label>
                  <input
                    name={`${name}.${i}.${f.key}`}
                    value={row[f.key] ?? ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    className={cx(INPUT, "!py-1.5 !text-[13px]")}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label={`Remove row ${i + 1}`}
              onClick={() => setRows((prev) => prev.filter((_, ri) => ri !== i))}
              className="mb-1 rounded-md px-2 py-1.5 text-[var(--admin-mute-2)] hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {(!max || rows.length < max) && (
        <Button
          type="button"
          onClick={() => setRows((prev) => [...prev, Object.fromEntries(item.map((f) => [f.key, ""]))])}
          className="mt-2 !py-1.5 !text-[12px]"
        >
          + {addLabel}
        </Button>
      )}
    </div>
  );
}

/** Paragraphs, one per line — policy bodies. */
export function ParagraphsField({
  name,
  label,
  help,
  value,
}: {
  name: string;
  label: string;
  help?: string;
  value: string[];
}) {
  return (
    <TextArea
      name={name}
      label={label}
      help={help ?? "One paragraph per block. Leave a blank line between them."}
      rows={10}
      defaultValue={value.join("\n\n")}
    />
  );
}

/** Renders one field straight from its definition. */
export function AutoField({
  field,
  value,
  prefix = "",
  products = [],
}: {
  field: FieldDef;
  value: unknown;
  prefix?: string;
  /** The catalogue, for `products` fields. Empty for every other type. */
  products?: PickerProduct[];
}) {
  const name = prefix + field.key;
  switch (field.type) {
    case "textarea":
      return (
        <TextArea name={name} label={field.label} help={field.help} defaultValue={String(value ?? "")} />
      );
    case "number":
      return (
        <NumberField
          name={name}
          label={field.label}
          help={field.help}
          min={field.min}
          max={field.max}
          defaultValue={typeof value === "number" ? value : ""}
        />
      );
    case "toggle":
      return (
        <Toggle name={name} label={field.label} help={field.help} defaultChecked={Boolean(value)} />
      );
    case "color":
      return (
        <ColorField
          name={name}
          label={field.label}
          help={field.help}
          defaultValue={String(value ?? "#000000")}
        />
      );
    case "image":
      return (
        <ImageField name={name} label={field.label} help={field.help} defaultValue={String(value ?? "")} />
      );
    case "select":
      return (
        <SelectField
          name={name}
          label={field.label}
          help={field.help}
          defaultValue={String(value ?? "")}
          options={field.options ?? []}
        />
      );
    case "products":
      return (
        <ProductPicker
          name={name}
          label={field.label}
          help={field.help}
          max={field.max}
          featuredNote={field.featuredNote}
          products={products}
          value={
            Array.isArray(value)
              ? (value as { slug?: string }[]).map((r) => String(r?.slug ?? "")).filter(Boolean)
              : []
          }
        />
      );
    case "list":
      return (
        <ListField
          name={name}
          label={field.label}
          help={field.help}
          item={field.item ?? []}
          addLabel={field.addLabel}
          max={field.max}
          value={Array.isArray(value) ? (value as Record<string, string>[]) : []}
        />
      );
    default:
      return (
        <TextField
          name={name}
          label={field.label}
          help={field.help}
          placeholder={field.placeholder}
          defaultValue={String(value ?? "")}
        />
      );
  }
}

/**
 * The bar that slides up once something has changed. Shopify's contextual save
 * bar, in miniature: it is the only way to commit, so nothing saves by accident.
 */
export function SaveBar({ dirty, onReset }: { dirty: boolean; onReset?: () => void }) {
  const { pending } = useFormStatus();
  if (!dirty && !pending) return null;
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-[var(--admin-line)] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-[1180px] items-center justify-end gap-2">
        <span className="mr-auto text-[12.5px] text-[var(--admin-mute)]">Unsaved changes</span>
        {onReset && (
          <Button type="button" onClick={onReset} disabled={pending}>
            Discard
          </Button>
        )}
        <Button tone="primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

/** Wraps a server action with dirty tracking and a result message. */
export function EditorForm({
  action,
  children,
  className,
}: {
  action: (state: { error?: string; ok?: string }, data: FormData) => Promise<{ error?: string; ok?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionStateSafe(action);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (state.ok) setDirty(false);
  }, [state.ok]);

  return (
    <form
      action={formAction}
      onChange={() => setDirty(true)}
      onInput={() => setDirty(true)}
      className={className}
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
      {children}
      <SaveBar dirty={dirty} />
    </form>
  );
}

function useActionStateSafe(
  action: (state: { error?: string; ok?: string }, data: FormData) => Promise<{ error?: string; ok?: string }>,
) {
  return useActionState<{ error?: string; ok?: string }, FormData>(action, {});
}
