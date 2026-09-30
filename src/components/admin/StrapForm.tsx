"use client";

import {
  ColorField,
  EditorForm,
  ImageField,
  NumberField,
  SelectField,
  TextField,
  Toggle,
} from "./fields";
import { Card } from "./ui";
import type { AdminStrap } from "@/lib/store/straps";

const COLOR_GROUPS = [
  "black", "white", "grey", "blue", "green", "red",
  "orange", "yellow", "pink", "brown", "gold",
].map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));

export default function StrapForm({
  strap,
  products,
  action,
  isNew = false,
}: {
  strap?: AdminStrap;
  products: { value: string; label: string }[];
  action: (s: { error?: string; ok?: string }, d: FormData) => Promise<{ error?: string; ok?: string }>;
  isNew?: boolean;
}) {
  const s = strap;
  return (
    <EditorForm action={action} className="space-y-4">
      {s && <input type="hidden" name="__sku" value={s.sku} />}

      <Card title="The strap">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Name" defaultValue={s?.name} required />
          {isNew && (
            <TextField
              name="sku"
              label="Reference"
              help="How you refer to it. Anything unique."
              placeholder="WB-VERTECH-BLACK"
              required
            />
          )}
          <TextField name="colorway" label="Colourway" defaultValue={s?.colorway} />
          <SelectField
            name="type"
            label="Type"
            defaultValue={s?.type ?? "rubber"}
            options={[
              { value: "rubber", label: "Rubber" },
              { value: "velcro", label: "VELCRO®" },
            ]}
          />
          <SelectField
            name="colorGroup"
            label="Colour filter group"
            defaultValue={s?.colorGroup ?? "grey"}
            options={COLOR_GROUPS}
          />
          <NumberField name="price" label="Price" prefix="$" min={0} defaultValue={s?.price ?? 0} />
          <SelectField
            name="pairedWith"
            label="Made for"
            help="For the VELCRO® straps that ship with a particular watch."
            defaultValue={s?.pairedWith ?? ""}
            options={[{ value: "", label: "Nothing in particular" }, ...products]}
          />
          <SelectField
            name="status"
            label="Status"
            defaultValue={s?.status ?? "active"}
            options={[
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ]}
          />
          <NumberField name="position" label="Sort order" defaultValue={s?.position ?? 0} />
        </div>
      </Card>

      <Card title="Stock">
        <div className="space-y-5">
          <Toggle name="track" label="Track stock for this strap" defaultChecked={s?.track} />
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField name="onHand" label="On hand" min={0} defaultValue={s?.onHand ?? 0} />
            <NumberField
              name="lowStockAt"
              label="Low-stock threshold"
              min={0}
              defaultValue={s?.lowStockAt ?? 2}
            />
          </div>
        </div>
      </Card>

      <Card
        title="Look"
        description="The picture is the fallback swatch; the colours tint the picker and the glow behind the watch."
      >
        <div className="space-y-5">
          <ImageField name="image" label="Picture" defaultValue={s?.image} />
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField name="primary" label="Primary colour" defaultValue={s?.primary} />
            <ColorField name="secondary" label="Secondary colour" defaultValue={s?.secondary} />
          </div>
        </div>
      </Card>
    </EditorForm>
  );
}
