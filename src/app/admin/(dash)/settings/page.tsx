import SettingsForms from "@/components/admin/SettingsForms";
import { Card, LinkButton, Notice, PageHeader } from "@/components/admin/ui";
import { getOrderEmails, getSettings } from "@/lib/store/settings";
import { getDelivery } from "@/lib/store/cart";
import { brevoKey, mediaBucket } from "@/lib/db/binding";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [settings, delivery, orderEmails, key] = await Promise.all([
    getSettings(),
    getDelivery(),
    getOrderEmails(),
    brevoKey(),
  ]);
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
        <SettingsForms
          settings={settings}
          delivery={delivery}
          orderEmails={orderEmails}
          emailReady={Boolean(key)}
        />

        <Card
          title="Search &amp; sharing"
          description="Page titles, the description search engines show, and whether the site is indexed."
        >
          <LinkButton href="/admin/content/seo">Open search settings</LinkButton>
        </Card>

        <Card title="Image uploads" description="Where pictures added from the dashboard are stored.">
          {uploads ? (
            <Notice tone="success">
              Uploads are on. Images added in the dashboard go to Cloudflare R2.
            </Notice>
          ) : (
            <Notice tone="info">
              Uploads are off — R2 is not enabled on this Cloudflare account, and every picture in
              the shop is stored there, so the image picker has nothing to list. An image field will
              still accept a full URL. To turn uploads on, enable R2 in the Cloudflare dashboard,
              then add an <code>R2</code> binding named <code>MEDIA</code> to{" "}
              <code>wrangler.jsonc</code>.
            </Notice>
          )}
        </Card>
      </div>
    </>
  );
}
