import Link from "next/link";
import Logo from "./Logo";
import { site } from "@/data/site";
import { FAMILY_LABEL, FAMILIES } from "@/data/products";

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

export default function Footer() {
  return (
    <footer id="about" className="relative border-t border-line bg-ink-2">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">{site.blurb}</p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12px] text-mute transition-colors hover:border-gold hover:text-gold"
              >
                <Instagram />
                {site.social.instagramHandle}
              </a>
              <a
                href={`https://wa.me/${site.contact.whatsapp}`}
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
            <h3 className="eyebrow">Collection</h3>
            <ul className="mt-5 space-y-2.5">
              {FAMILIES.map((f) => (
                <li key={f}>
                  <Link
                    href={`/products?family=${f}`}
                    className="text-sm text-mute transition-colors hover:text-chalk"
                  >
                    {FAMILY_LABEL[f]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-sm text-mute transition-colors hover:text-chalk">
                  All references
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Policies</h3>
            <ul className="mt-5 space-y-2.5">
              {site.policies.map((p) => (
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
            <h3 className="eyebrow">Contact</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-mute">
              <li>
                <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="hover:text-chalk">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.contact.email}`} className="hover:text-chalk">
                  {site.contact.email}
                </a>
              </li>
              <li className="pt-1 text-mute-2">{site.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 rule" />

        <div className="mt-6 flex flex-col gap-3 text-[11px] leading-relaxed text-mute-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.longName}. All rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">
            WTC is an independent reseller. Not affiliated with, endorsed by or
            sponsored by Swatch AG or OMEGA SA. Product names and photography remain
            the property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
