"use client";

import { useState } from "react";
import {
  ColorField,
  EditorForm,
  ListField,
  NumberField,
  SelectField,
  TextArea,
  TextField,
} from "./fields";
import PhotoList from "./PhotoList";
import type { UploadedImage } from "./fields";
import { Card, FoldCard } from "./ui";
import { slugify } from "@/lib/slug";
import { MAX_PHOTOS } from "@/lib/products/constants";
import type { AdminProduct } from "@/lib/store/products";
import type { AdminCollection } from "@/lib/store/collections";

const FAMILIES = [
  { value: "classics", label: "Classics" },
  { value: "moonphase", label: "Moonphase" },
  { value: "earthphase", label: "Earthphase" },
  { value: "mission-on-earth", label: "Mission on Earth" },
  { value: "special", label: "Special Edition" },
  { value: "royal-pop", label: "Royal Pop" },
];

const FAMILY_LABEL: Record<string, string> = Object.fromEntries(
  FAMILIES.map((f) => [f.value, f.label]),
);

const COLOR_GROUPS = [
  "black", "white", "grey", "blue", "green", "red",
  "orange", "yellow", "pink", "brown", "gold",
].map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));

const AVAILABILITY = [
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock" },
  { value: "pre-order", label: "Pre-order" },
  { value: "sold-out", label: "Sold out" },
];

const STATUS = [
  { value: "active", label: "Active — on sale" },
  { value: "draft", label: "Draft — hidden from the shop" },
  { value: "archived", label: "Archived — kept for old orders" },
];

/**
 * One watch.
 *
 * Six cards of equal weight became a short form and three folds. Adding a
 * watch needs a name, a reference, a price, how many there are, which
 * collection it belongs to and a photograph — the rest of the record has a
 * reasonable answer already, and the ones that can be worked out from the name
 * now are.
 *
 * Derived fields are filled as you type and stop the moment you edit them
 * yourself, so the guess is a starting point rather than something to undo.
 */
export default function ProductForm({
  product,
  collections,
  strapOptions,
  action,
  isNew = false,
  uploads = [],
}: {
  product?: AdminProduct;
  collections: AdminCollection[];
  strapOptions: { value: string; label: string }[];
  action: (state: { error?: string; ok?: string }, data: FormData) => Promise<{ error?: string; ok?: string }>;
  isNew?: boolean;
  /** Images uploaded under Images, so they can be picked here too. */
  uploads?: UploadedImage[];
}) {
  const p = product;

  const [name, setName] = useState(p?.name ?? "");
  const [shortName, setShortName] = useState(p?.shortName ?? "");
  const [slug, setSlug] = useState("");
  const [family, setFamily] = useState<string>(p?.family ?? "classics");
  const [familyLabel, setFamilyLabel] = useState(p?.familyLabel ?? "");
  // Once a field has been typed in by hand it stops following the name.
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const own = (k: string) => setTouched((prev) => new Set(prev).add(k));

  const onName = (v: string) => {
    setName(v);
    if (!touched.has("shortName")) setShortName(v.replace(/^Mission to (the )?/i, "").trim());
    if (isNew && !touched.has("slug")) setSlug(slugify(v));
  };

  const onFamily = (v: string) => {
    setFamily(v);
    if (!touched.has("familyLabel")) setFamilyLabel(FAMILY_LABEL[v] ?? "");
  };

  return (
    <EditorForm action={action} className="space-y-4">
      {p && <input type="hidden" name="__slug" value={p.slug} />}

      {/* ── What a watch actually needs ──────────────────────────────────── */}
      <Card
        title="The watch"
        description="Everything a customer sees. The rest has a sensible answer already."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PhotoList value={p?.photos ?? []} max={MAX_PHOTOS} uploads={uploads} />
          </div>

          <div className="sm:col-span-2">
            <TextField
              name="name"
              label="Name"
              value={name}
              onChange={onName}
              placeholder="Mission to the Moon"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <TextField
              name="tagline"
              label="Subtitle"
              help="One line, under the name on cards and on the watch's own page."
              defaultValue={p?.tagline}
            />
          </div>

          <NumberField name="price" label="Price" prefix="$" min={0} defaultValue={p?.price ?? 0} />
          <SelectField
            name="status"
            label="Status"
            defaultValue={p?.status ?? "active"}
            options={STATUS}
          />

          <div className="sm:col-span-2">
            <TextArea name="description" label="Description" rows={5} defaultValue={p?.description} />
          </div>

          <div className="sm:col-span-2">
            <TextField
              name="footerNote"
              label="Note under the buttons"
              help="The small line under Add to bag. Leave empty to use the shared one from Sections → Product page."
              defaultValue={p?.footerNote}
              placeholder="Supplied with box and papers."
            />
          </div>
        </div>
      </Card>

      {/* ── Everything with a sensible answer already ─────────────────────── */}
      <FoldCard
        title="Catalogue details"
        description="Reference, collection, series and colour — these drive the shop's filters."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="sku" label="Reference" placeholder="SO33M100" defaultValue={p?.sku} />
          <SelectField
            name="collection"
            label="Collection"
            help="Also switchable straight from the Watches list."
            defaultValue={p ? p.collection : collections[0]?.id}
            options={[
              { value: "", label: "Unfiled — in the catalogue, in no collection" },
              ...collections.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <TextField
            name="shortName"
            label="Short name"
            help="Used on chips and in tight spaces. Filled in from the name."
            value={shortName}
            onChange={(v: string) => {
              own("shortName");
              setShortName(v);
            }}
          />
          {isNew && (
            <TextField
              name="slug"
              label="Web address"
              help="Filled in from the name."
              prefix="/products/"
              value={slug}
              onChange={(v: string) => {
                own("slug");
                setSlug(v);
              }}
            />
          )}
          <SelectField
            name="family"
            label="Series"
            value={family}
            onChange={onFamily}
            options={FAMILIES}
          />
          <TextField
            name="familyLabel"
            label="Series label"
            help="How the series is written on the site. Filled in from the series."
            value={familyLabel}
            onChange={(v: string) => {
              own("familyLabel");
              setFamilyLabel(v);
            }}
          />
          <TextField name="colorway" label="Colourway" defaultValue={p?.colorway} />
          <SelectField
            name="colorGroup"
            label="Colour filter group"
            defaultValue={p?.colorGroup ?? "grey"}
            options={COLOR_GROUPS}
          />
          <NumberField name="year" label="Year" min={1980} max={2100} defaultValue={p?.year ?? 2022} />
          <NumberField
            name="compareAt"
            label="Compare-at price"
            help="Shown struck through. Leave empty for none."
            prefix="$"
            min={0}
            defaultValue={p?.compareAt ?? ""}
          />
          <SelectField
            name="strapType"
            label="Ships on"
            defaultValue={p?.strapType ?? "velcro"}
            options={[
              { value: "velcro", label: "VELCRO®" },
              { value: "rubber", label: "Rubber" },
            ]}
          />
          <SelectField
            name="stockStrapSku"
            label="Strap it ships with"
            defaultValue={p?.stockStrapSku ?? ""}
            options={[{ value: "", label: "None" }, ...strapOptions]}
          />
          <SelectField
            name="availability"
            label="Availability badge"
            help="Only used for pre-orders, and when this watch is left uncounted on the Watches list."
            defaultValue={p?.availability ?? "in-stock"}
            options={AVAILABILITY}
          />
          <NumberField
            name="position"
            label="Sort order"
            help="Lower comes first in the catalogue."
            defaultValue={p?.position ?? 0}
          />
          <NumberField
            name="bestsellerRank"
            label="Bestseller rank"
            help="Set under Sections → Bestsellers rail, which renumbers the whole rail at once."
            min={1}
            max={50}
            defaultValue={p?.bestsellerRank ?? ""}
          />
          <div className="sm:col-span-2">
            <ListField
              name="specs"
              label="Specification"
              help="The table under the buttons. Leave it empty to use the shared rows from Sections → Product page."
              addLabel="Add a row"
              max={12}
              item={[
                { key: "label", label: "Label", type: "text" },
                { key: "value", label: "Value", type: "text" },
              ]}
              value={p?.specs ?? []}
            />
          </div>
        </div>
      </FoldCard>

      <FoldCard
        title="Colours"
        description="Sampled from the photography. They tint the cards, the glow behind the watch and the films."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <ColorField name="paletteCase" label="Case" defaultValue={p?.palette.case} />
          <ColorField name="paletteBezel" label="Bezel" defaultValue={p?.palette.bezel} />
          <ColorField name="paletteDial" label="Dial" defaultValue={p?.palette.dial} />
          <ColorField name="paletteSubdial" label="Subdial" defaultValue={p?.palette.subdial} />
          <ColorField name="paletteStrap" label="Strap" defaultValue={p?.palette.strap} />
        </div>
      </FoldCard>
    </EditorForm>
  );
}
