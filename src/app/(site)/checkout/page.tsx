import type { Metadata } from "next";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { getSection, str, getSettings } from "@/lib/store/storefront";
export { dynamic } from "@/lib/runtime";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [section, { contact }] = await Promise.all([getSection("checkout"), getSettings()]);

  const copy = {
    detailsHeading: str(section, "detailsHeading"),
    addressHeading: str(section, "addressHeading"),
    paymentHeading: str(section, "paymentHeading"),
    paymentMethod: str(section, "paymentMethod"),
    paymentCopy: str(section, "paymentCopy"),
    summaryHeading: str(section, "summaryHeading"),
    submitLabel: str(section, "submitLabel"),
    reassurance: str(section, "reassurance"),
    emptyTitle: str(section, "emptyTitle"),
    emptyCopy: str(section, "emptyCopy"),
    emptyCta: str(section, "emptyCta"),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-32 sm:px-6 lg:px-10">
      <p className="eyebrow">{str(section, "eyebrow")}</p>
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.04] tracking-[-0.03em]">
        {str(section, "title")}
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-mute">{str(section, "copy")}</p>

      <div className="mt-12">
        <CheckoutForm copy={copy} whatsapp={contact.whatsapp} />
      </div>
    </div>
  );
}
