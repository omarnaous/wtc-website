import ImportCatalogue from "@/components/admin/ImportCatalogue";
import SettingsForms from "@/components/admin/SettingsForms";
import { Card, LinkButton, Notice, PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/store/settings";
import { getDelivery } from "@/lib/store/cart";
import { mediaBucket } from "@/lib/db/binding";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [settings, delivery] = await Promise.all([getSettings(), getDelivery()]);
  const uploads = Boolean(await mediaBucket());
  const placeholderPhone = /0{2}\s*0{3}\s*0{3}/.test(settings.contact.phone);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="The brand, how customers reach you, and where the shop points."
      />

      {placeholderPhone && (
        <div className="mb-4">
          <Notice tone="warn">
            The phone number is still the placeholder the design shipped with. Every WhatsApp and
            call button on the site points at it.
          </Notice>
        </div>
      )}

      <div className="space-y-4">
        <SettingsForms settings={settings} delivery={delivery} />

        <Card
          title="Search &amp; sharing"
          description="Page titles, the description search engines show, and whether the site is indexed."
        >
          <LinkButton href="/admin/content/seo">Open search settings</LinkButton>
        </Card>

        <Card
          title="Catalogue import"
          description="Reloads the watches, straps and photography that ship with the design. Prices, stock and copy you have edited are left alone."
        >
          <ImportCatalogue label="Re-import the catalogue" />
        </Card>

        <Card title="Image uploads" description="Where pictures added from the dashboard are stored.">
          {uploads ? (
            <Notice tone="success">
              Uploads are on. Images added in the dashboard go to Cloudflare R2.
            </Notice>
          ) : (
            <Notice tone="info">
              Uploads are off — R2 is not enabled on this Cloudflare account. The image picker still
              browses everything already in the site&apos;s <code>public/</code> folder, and any
              image field accepts a URL. To turn uploads on, enable R2 in the Cloudflare dashboard,
              then add an <code>R2</code> binding named <code>MEDIA</code> to{" "}
              <code>wrangler.jsonc</code>.
            </Notice>
          )}
        </Card>
      </div>
    </>
  );
}
