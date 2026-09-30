"use client";

import { useActionState } from "react";
import { ColorField, EditorForm, NumberField, SelectField, TextArea, TextField } from "./fields";
import CollectionItems, { type CollectionItem } from "./CollectionItems";
import { Button, Card, Notice } from "./ui";
import {
  deleteCollection,
  saveCollection,
  type State,
} from "@/app/admin/(dash)/collections/actions";
import type { AdminCollection } from "@/lib/store/collections";

export default function CollectionCard({
  collection,
  products,
  items,
}: {
  collection: AdminCollection;
  products: { value: string; label: string }[];
  /** The watches filed under it, in their current order. */
  items: CollectionItem[];
}) {
  const [delState, delAction] = useActionState<State, FormData>(deleteCollection, {});

  return (
    <div className="space-y-2">
      <EditorForm action={saveCollection}>
        <input type="hidden" name="__id" value={collection.id} />
        <Card
          title={collection.name}
          description={`${collection.count ?? 0} watch${collection.count === 1 ? "" : "es"} · id: ${collection.id}`}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Name" defaultValue={collection.name} />
            <SelectField
              name="heroSlug"
              label="Watch on the tile"
              defaultValue={collection.heroSlug ?? ""}
              options={[{ value: "", label: "None" }, ...products]}
            />
            <div className="sm:col-span-2">
              <TextArea name="blurb" label="Blurb" rows={2} defaultValue={collection.blurb} />
            </div>
            <ColorField name="accent" label="Accent colour" defaultValue={collection.accent} />
            <TextField
              name="monogram"
              label="Monogram"
              help="Drawn large on the tile when no watch is shown. Two or three letters."
              defaultValue={collection.monogram}
            />
            <SelectField
              name="state"
              label="On the tile, this reads as"
              help="Automatic means a collection with nothing in it is not open yet."
              defaultValue={collection.state ?? "auto"}
              options={[
                { value: "auto", label: "Automatic — open once it has watches" },
                { value: "upcoming", label: "Not open yet" },
                { value: "open", label: "Open" },
              ]}
            />
            <TextField
              name="badge"
              label="Badge while it is not open"
              help='Leave empty for the shared wording in Sections → Collections tiles.'
              defaultValue={collection.badge}
              placeholder="Coming soon"
            />
            <SelectField
              name="status"
              label="Status"
              defaultValue={collection.status}
              options={[
                { value: "active", label: "Shown on the site" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
            <NumberField name="position" label="Sort order" defaultValue={collection.position} />
            <div className="sm:col-span-2">
              <CollectionItems items={items} />
            </div>
          </div>
        </Card>
      </EditorForm>

      {delState.error && <Notice tone="error">{delState.error}</Notice>}
      {delState.ok && <Notice tone="success">{delState.ok}</Notice>}

      <form action={delAction} className="flex justify-end">
        <input type="hidden" name="__id" value={collection.id} />
        <Button type="submit" tone="ghost" className="!text-[12px] text-red-600 hover:!text-red-700">
          Delete {collection.name}
        </Button>
      </form>
    </div>
  );
}
