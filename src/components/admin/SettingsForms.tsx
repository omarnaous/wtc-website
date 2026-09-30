"use client";

import { EditorForm, ImageField, NumberField, TextArea, TextField } from "./fields";
import { Card } from "./ui";
import {
  saveBrand,
  saveContact,
  saveDelivery,
  saveSocial,
} from "@/app/admin/(dash)/settings/actions";
import type { SiteSettings } from "@/lib/store/settings";
import type { Delivery } from "@/lib/store/cart";

export default function SettingsForms({
  settings,
  delivery,
}: {
  settings: SiteSettings;
  delivery: Delivery;
}) {
  const { brand, contact, social } = settings;

  return (
    <div className="space-y-4">
      <EditorForm action={saveBrand}>
        <Card title="Brand">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Short name" defaultValue={brand.name} />
            <TextField name="longName" label="Full name" defaultValue={brand.longName} />
            <TextField name="tagline" label="Tagline" defaultValue={brand.tagline} />
            <TextField name="location" label="Location" defaultValue={brand.location} />
            <div className="sm:col-span-2">
              <TextArea name="intro" label="Intro" rows={2} defaultValue={brand.intro} />
            </div>
            <div className="sm:col-span-2">
              <TextArea
                name="blurb"
                label="About"
                help="Used in the footer and as the site description."
                rows={4}
                defaultValue={brand.blurb}
              />
            </div>
            <div className="sm:col-span-2">
              <ImageField name="logo" label="Logo" defaultValue={brand.logo} />
            </div>
          </div>
        </Card>
      </EditorForm>

      <EditorForm action={saveContact}>
        <Card title="Contact" description="Every call and WhatsApp button on the site uses these.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="phone"
              label="Phone"
              help="As it should read on the site."
              defaultValue={contact.phone}
              placeholder="+961 3 123 456"
            />
            <TextField
              name="whatsapp"
              label="WhatsApp number"
              help="Digits only, with the country code. 9613123456"
              defaultValue={contact.whatsapp}
              placeholder="9613123456"
            />
          </div>
        </Card>
      </EditorForm>

      <EditorForm action={saveDelivery}>
        <Card title="Delivery" description="What checkout charges, and when it stops charging.">
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              name="fee"
              label="Delivery charge"
              prefix="$"
              min={0}
              defaultValue={delivery.fee}
            />
            <NumberField
              name="freeOver"
              label="Free delivery above"
              help="0 means delivery is always charged."
              prefix="$"
              min={0}
              defaultValue={delivery.freeOver}
            />
          </div>
        </Card>
      </EditorForm>

      <EditorForm action={saveSocial}>
        <Card title="Social">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="instagram" label="Instagram link" defaultValue={social.instagram} />
            <TextField
              name="instagramHandle"
              label="Instagram handle"
              defaultValue={social.instagramHandle}
            />
            <TextField
              name="tiktok"
              label="TikTok link"
              help="Leave as # to hide the link."
              defaultValue={social.tiktok}
            />
          </div>
        </Card>
      </EditorForm>
    </div>
  );
}
