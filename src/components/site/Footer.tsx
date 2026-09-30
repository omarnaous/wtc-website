import Link from "next/link";
import Logo from "./Logo";
import { getSection, str } from "@/lib/store/content";
import { getSettings } from "@/lib/store/settings";
import { listCollections } from "@/lib/store/collections";
import { listPolicies } from "@/lib/store/policies";

function Instagram() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function WhatsApp() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5s0-.4-.1-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.6.1 2.7 2.7 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

/**
 * The closing block. Collections, policies and contact details are all read
 * back out of the shop, so a policy added in the dashboard appears here.
 */
export default async function Footer() {
  const [footer, { brand, contact, social }, collections, policies] = await Promise.all([
    getSection("footer"),
    getSettings(),
    listCollections(),
    listPolicies(),
  ]);

  return (
    <footer id="about" className="relative border-t border-line bg-ink-2">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo logo={brand.logo} name={brand.name} tagline={brand.tagline} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">
              {str(footer, "blurb") || brand.blurb}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12px] text-mute transition-colors hover:border-gold hover:text-gold"
              >
                <Instagram />
                {social.instagramHandle}
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12px] text-mute transition-colors hover:border-gold hover:text-gold"
              >
                <WhatsApp />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h3 className="eyebrow">{str(footer, "shopHeading", "Shop")}</h3>
            <ul className="mt-5 space-y-2.5">
              {collections.map((c) =>
                (c.count ?? 0) === 0 ? (
                  <li key={c.id} className="flex items-center gap-2 text-sm text-mute-2">
                    {c.name}
                    <span className="text-[10px] uppercase tracking-[0.12em]">
                      {str(footer, "soonLabel", "soon")}
                    </span>
                  </li>
                ) : (
                  <li key={c.id}>
                    <Link
                      href={`/products?collection=${c.id}`}
                      className="text-sm text-mute transition-colors hover:text-chalk"
                    >
                      {c.name}
                    </Link>
                  </li>
                )
              )}
              <li>
                <Link href="/products" className="text-sm text-mute transition-colors hover:text-chalk">
                  {str(footer, "allLabel", "All references")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">{str(footer, "policiesHeading", "Policies")}</h3>
            <ul className="mt-5 space-y-2.5">
              {policies.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/policies/${p.slug}`}
                    className="text-sm text-mute transition-colors hover:text-chalk"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">{str(footer, "contactHeading", "Get in touch")}</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-mute">
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-chalk">
                  {contact.phone}
                </a>
              </li>
              <li className="pt-1 text-mute-2">{brand.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 rule" />

        <div className="mt-6 flex flex-col gap-3 text-[11px] leading-relaxed text-mute-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.longName}. All rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">{str(footer, "note")}</p>
        </div>
      </div>
    </footer>
  );
}
