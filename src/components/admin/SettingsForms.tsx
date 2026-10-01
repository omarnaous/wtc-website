"use client";

import { useActionState } from "react";
import { EditorForm, ImageField, NumberField, TextArea, TextField, Toggle } from "./fields";
import { Button, Card, Notice } from "./ui";
import {
  saveBrand,
  saveContact,
  saveDelivery,
  saveOrderEmails,
  saveSocial,
  sendTestOrderEmails,
  type State,
} from "@/app/admin/(dash)/settings/actions";
import type { OrderEmails, SiteSettings } from "@/lib/store/settings";
import type { Delivery } from "@/lib/store/cart";

/** Sends both order emails, from a made-up order, to the shop's inbox. */
function TestEmails() {
  const [state, action, pending] = useActionState<State, FormData>(sendTestOrderEmails, {});
  return (
    <form action={action} className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--admin-line-soft)] pt-4">
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send a test"}
      </Button>
      <span className="text-[12.5px] text-[var(--admin-mute)]">
        Both emails, from a made-up order, to the alert addresses — never to a customer.
      </span>
      {(state.ok || state.error) && (
        <div className="w-full">
          <Notice tone={state.error ? "error" : "success"}>{state.error ?? state.ok}</Notice>
        </div>
      )}
    </form>
  );
}

export default function SettingsForms({
  settings,
  delivery,
  orderEmails,
  emailReady,
}: {
  settings: SiteSettings;
  delivery: Delivery;
  orderEmails: OrderEmails;
  /** Whether the Brevo key is set on this environment. */
  emailReady: boolean;
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

      <Card
        title="Order emails"
        description="What goes out, through Brevo, when someone places an order on the site."
      >
        {!emailReady && (
          <div className="mb-4">
            <Notice tone="warn">
              No Brevo key on this environment, so nothing is sent. It is set as the Worker secret
              BREVO_API_KEY.
            </Notice>
          </div>
        )}
        <EditorForm action={saveOrderEmails}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="fromName"
              label="Sent from — name"
              defaultValue={orderEmails.fromName}
              placeholder={settings.brand.longName}
            />
            <TextField
              name="fromEmail"
              label="Sent from — address"
              help="Must be a verified sender in your Brevo account."
              defaultValue={orderEmails.fromEmail}
            />
            <div className="sm:col-span-2">
              <TextField
                name="notify"
                label="New-order alerts go to"
                help="One or more addresses, separated by commas."
                defaultValue={orderEmails.notify}
              />
            </div>
            <Toggle
              name="customer"
              label="Email the customer a confirmation"
              help="Every website order — checkout asks for an email."
              defaultChecked={orderEmails.customer}
            />
            <Toggle
              name="admin"
              label="Email the shop about every new order"
              defaultChecked={orderEmails.admin}
            />
          </div>
        </EditorForm>
        <TestEmails />
      </Card>

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
