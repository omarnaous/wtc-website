// Everything a visitor can reach you on. Edit here; the whole site reads from this file.
export const CONTACT = {
  // ⚠️ PLACEHOLDER: your WhatsApp number in international format, digits only (961 + number, no "+", no spaces).
  whatsapp: "96100000000",
  whatsappDisplay: "+961 00 000 000",
  instagram: "https://www.instagram.com/appifylb",
  instagramHandle: "@appifylb",
  website: "www.appify-lb.com",
};
export const isPlaceholderNumber = /^9610+$/.test(CONTACT.whatsapp);

export const SERVICES = ["Motion graphics", "Websites", "Mobile apps", "AI agents", "UI/UX", "Meta Ads"];

// Booking: the days and times offered in the appointment box (24 h, local time).
export const BOOKING = {
  days: 14,                                     // how many days ahead can be picked
  closedWeekdays: [0],                          // 0 = Sunday
  slots: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
};

export const waLink = (text) => `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
