import { run } from "@/lib/db/sql";
import { getOrder, type Order } from "@/lib/store/orders";
import { getOrderEmails, getSettings, notifyList } from "@/lib/store/settings";
import { sendMail, type SendResult } from "./brevo";

/**
 * The two emails a website order sends: a confirmation to the customer and a
 * new-order alert to the shop. Checkout requires an email; an order keyed in
 * on the dashboard may not have one, and then only the alert goes.
 *
 * Neither may ever break an order. Both run after the response has gone, every
 * failure is caught, and what happened is written onto the order's history so
 * the dashboard shows whether the customer was emailed.
 */

export interface MailLine {
  name: string;
  qty: number;
  unit_price: number;
  image: string;
  kind: "watch" | "strap";
}

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

/** The WhatsApp number that shipped with the design is a placeholder; never link it. */
const realWhatsApp = (w: string) => /^\d{8,15}$/.test(w) && !/^9610+$/.test(w);

const absolute = (origin: string, src: string) =>
  !src ? "" : /^https?:\/\//.test(src) ? src : `${origin}${src.startsWith("/") ? "" : "/"}${src}`;

const INK = "#111114";
const MUTE = "#6b6b73";
const LINE = "#e7e7ea";
const GOLD = "#a8841f";

function shell(title: string, preheader: string, body: string, footer: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid ${LINE}">
${body}
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.6;color:${MUTE};text-align:center">${footer}</p>
</td></tr></table></body></html>`;
}

function header(origin: string, logo: string, name: string) {
  const img = absolute(origin, logo);
  return `<tr><td style="padding:28px 32px 8px">
${img ? `<img src="${esc(img)}" width="40" height="40" alt="" style="display:inline-block;vertical-align:middle;border-radius:10px;background:${INK}">` : ""}
<span style="display:inline-block;vertical-align:middle;margin-left:${img ? 10 : 0}px;font-size:16px;font-weight:700;letter-spacing:.18em">${esc(name)}</span>
</td></tr>`;
}

function itemsTable(origin: string, lines: MailLine[]) {
  const rows = lines
    .map((l) => {
      const img = absolute(origin, l.image);
      return `<tr>
<td width="64" style="padding:12px 0;border-top:1px solid ${LINE};vertical-align:middle">${img ? `<img src="${esc(img)}" width="56" height="56" alt="" style="display:block;border-radius:10px;background:#f4f4f6;object-fit:contain">` : ""}</td>
<td style="padding:12px 12px;border-top:1px solid ${LINE};font-size:14px;line-height:1.4;vertical-align:middle">${esc(l.name)}<br><span style="color:${MUTE};font-size:12px">${l.kind === "strap" ? "Strap" : "Watch"} · ${l.qty} × ${money(l.unit_price)}</span></td>
<td align="right" style="padding:12px 0;border-top:1px solid ${LINE};font-size:14px;white-space:nowrap;vertical-align:middle">${money(l.unit_price * l.qty)}</td>
</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function totalsTable(order: Order) {
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;font-size:${strong ? 15 : 13}px;color:${strong ? INK : MUTE};${strong ? "font-weight:700;" : ""}">${label}</td><td align="right" style="padding:4px 0;font-size:${strong ? 15 : 13}px;${strong ? "font-weight:700;" : ""}">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};margin-top:4px;padding-top:8px">
${row("Subtotal", money(order.subtotal))}
${order.discount ? row("Discount", `−${money(order.discount)}`) : ""}
${row("Delivery", order.shipping ? money(order.shipping) : "Free")}
${row("Total", money(order.total), true)}
</table>`;
}

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px">${esc(label)}</a>`;

const addressLines = (o: Order) => [o.address_line, o.area, o.city].filter(Boolean).map(esc).join("<br>");

const textLines = (lines: MailLine[]) =>
  lines.map((l) => `- ${l.name} — ${l.qty} × ${money(l.unit_price)} = ${money(l.unit_price * l.qty)}`).join("\n");

const textTotals = (o: Order) =>
  [
    `Subtotal: ${money(o.subtotal)}`,
    o.discount ? `Discount: -${money(o.discount)}` : "",
    `Delivery: ${o.shipping ? money(o.shipping) : "Free"}`,
    `Total: ${money(o.total)}`,
  ]
    .filter(Boolean)
    .join("\n");

// ── The customer's confirmation ─────────────────────────────────────────────

function customerMail(order: Order, lines: MailLine[], origin: string, brand: { name: string; longName: string; logo: string }, contact: { phone: string; whatsapp: string }) {
  const first = order.customer_name.split(/\s+/)[0] || order.customer_name;
  const receipt = `${origin}/order/${order.id}`;
  const wa = realWhatsApp(contact.whatsapp) ? `https://wa.me/${contact.whatsapp}` : "";
  const shop = brand.longName || brand.name;

  const body = `${header(origin, brand.logo, brand.name)}
<tr><td style="padding:16px 32px 0">
<p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${GOLD}">Order #${order.number}</p>
<h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:700">Thanks, ${esc(first)} — your order is in.</h1>
<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:${MUTE}">We will call or message you on <strong style="color:${INK}">${esc(order.phone)}</strong> to confirm it and arrange delivery. You pay in cash when it arrives.</p>
</td></tr>
<tr><td style="padding:20px 32px 0">${itemsTable(origin, lines)}${totalsTable(order)}</td></tr>
<tr><td style="padding:20px 32px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" style="vertical-align:top;font-size:13px;line-height:1.6"><span style="color:${MUTE}">Delivering to</span><br>${esc(order.customer_name)}<br>${addressLines(order)}</td>
<td width="50%" style="vertical-align:top;font-size:13px;line-height:1.6"><span style="color:${MUTE}">Payment</span><br>Cash on delivery</td>
</tr></table>
</td></tr>
<tr><td style="padding:24px 32px 32px">${button(receipt, "View your order")}</td></tr>`;

  const footer = [
    `Questions? Reply to this email${wa ? ` or <a href="${wa}" style="color:${MUTE}">message us on WhatsApp</a>` : ""}.`,
    esc(shop),
  ].join("<br>");

  const text = [
    `Thanks, ${first} — your order is in.`,
    ``,
    `Order #${order.number}`,
    `We will call or message you on ${order.phone} to confirm it and arrange delivery. You pay in cash when it arrives.`,
    ``,
    textLines(lines),
    ``,
    textTotals(order),
    ``,
    `Delivering to: ${[order.customer_name, order.address_line, order.area, order.city].filter(Boolean).join(", ")}`,
    ``,
    `View your order: ${receipt}`,
    ``,
    `Questions? Reply to this email${wa ? ` or message us on WhatsApp: ${wa}` : ""}.`,
    shop,
  ].join("\n");

  return {
    subject: `Your ${brand.name} order #${order.number}`,
    preheader: `${lines.length} item${lines.length === 1 ? "" : "s"} · ${money(order.total)} · cash on delivery`,
    html: shell(`Order #${order.number}`, `${money(order.total)} — we will be in touch to confirm delivery`, body, footer),
    text,
  };
}

// ── The shop's new-order alert ──────────────────────────────────────────────

function adminMail(order: Order, lines: MailLine[], origin: string, brand: { name: string; logo: string }) {
  const link = `${origin}/admin/orders/${order.id}`;
  const digits = order.phone.replace(/\D/g, "");
  const wa = digits ? `https://wa.me/${digits}` : "";

  const body = `${header(origin, brand.logo, brand.name)}
<tr><td style="padding:16px 32px 0">
<p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${GOLD}">New order #${order.number}</p>
<h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:700">${money(order.total)} from ${esc(order.customer_name)}</h1>
<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:${MUTE}">Placed on the website. Cash on delivery — it is pending until you confirm it.</p>
</td></tr>
<tr><td style="padding:20px 32px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6">
<tr><td width="96" style="color:${MUTE};vertical-align:top">Phone</td><td><a href="tel:${esc(order.phone.replace(/\s+/g, ""))}" style="color:${INK}">${esc(order.phone)}</a>${wa ? ` · <a href="${wa}" style="color:${GOLD}">WhatsApp</a>` : ""}</td></tr>
${order.email ? `<tr><td style="color:${MUTE};vertical-align:top">Email</td><td><a href="mailto:${esc(order.email)}" style="color:${INK}">${esc(order.email)}</a></td></tr>` : ""}
<tr><td style="color:${MUTE};vertical-align:top">Deliver to</td><td>${addressLines(order)}</td></tr>
${order.note ? `<tr><td style="color:${MUTE};vertical-align:top">Note</td><td>${esc(order.note)}</td></tr>` : ""}
</table>
</td></tr>
<tr><td style="padding:20px 32px 0">${itemsTable(origin, lines)}${totalsTable(order)}</td></tr>
<tr><td style="padding:24px 32px 32px">${button(link, "Open in the dashboard")}</td></tr>`;

  const text = [
    `New order #${order.number} — ${money(order.total)} from ${order.customer_name}`,
    ``,
    `Phone: ${order.phone}${wa ? ` (WhatsApp: ${wa})` : ""}`,
    order.email ? `Email: ${order.email}` : "",
    `Deliver to: ${[order.address_line, order.area, order.city].filter(Boolean).join(", ")}`,
    order.note ? `Note: ${order.note}` : "",
    ``,
    textLines(lines),
    ``,
    textTotals(order),
    ``,
    `Open in the dashboard: ${link}`,
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");

  return {
    subject: `New order #${order.number} — ${money(order.total)} — ${order.customer_name}`,
    html: shell(`New order #${order.number}`, `${order.customer_name} · ${order.phone} · ${money(order.total)}`, body, `Sent by the ${esc(brand.name)} shop.`),
    text,
  };
}

// ── Sending ─────────────────────────────────────────────────────────────────

async function note(orderId: string, message: string) {
  try {
    await run(
      `INSERT INTO order_events (order_id, type, message, actor) VALUES (?,?,?,?)`,
      orderId,
      "email",
      message,
      "system",
    );
  } catch {
    // The history line is a nicety; losing it must not surface anywhere.
  }
}

const outcome = (r: SendResult, what: string) => (r.ok ? `${what}.` : `${what} failed — ${r.error}.`);

/** Sends both emails for a freshly placed order. Never throws. */
export async function sendOrderEmails(order: Order, lines: MailLine[], origin: string): Promise<void> {
  try {
    const [cfg, { brand, contact }] = await Promise.all([getOrderEmails(), getSettings()]);
    const from = { name: cfg.fromName || brand.longName || brand.name, email: cfg.fromEmail };
    if (!from.email) {
      await note(order.id, "No emails sent — set a sender under Settings → Order emails.");
      return;
    }
    const shopInbox = notifyList(cfg);

    const jobs: Promise<void>[] = [];

    if (cfg.customer && order.email) {
      const m = customerMail(order, lines, origin, brand, contact);
      jobs.push(
        sendMail({
          from,
          to: [{ email: order.email, name: order.customer_name }],
          // Replies reach the shop, not the sending address.
          replyTo: { email: shopInbox[0] ?? from.email, name: from.name },
          subject: m.subject,
          html: m.html,
          text: m.text,
          tags: ["order-confirmation"],
        }).then((r) => note(order.id, outcome(r, `Confirmation emailed to ${order.email}`))),
      );
    }

    if (cfg.admin && shopInbox.length) {
      const m = adminMail(order, lines, origin, brand);
      jobs.push(
        sendMail({
          from,
          to: shopInbox.map((email) => ({ email })),
          // Hitting reply answers the customer directly, when they left an email.
          replyTo: order.email ? { email: order.email, name: order.customer_name } : undefined,
          subject: m.subject,
          html: m.html,
          text: m.text,
          tags: ["new-order"],
        }).then((r) => note(order.id, outcome(r, `New-order alert sent to ${shopInbox.join(", ")}`))),
      );
    }

    await Promise.all(jobs);
  } catch (e) {
    await note(order.id, `Order emails failed — ${e instanceof Error ? e.message : "unknown error"}.`);
  }
}

/** For the dashboard's "send a test" button: both emails, to the shop inbox. */
export function previewOrderEmails(order: Order, lines: MailLine[], origin: string, brand: { name: string; longName: string; logo: string }, contact: { phone: string; whatsapp: string }) {
  return { customer: customerMail(order, lines, origin, brand, contact), admin: adminMail(order, lines, origin, brand) };
}

// ── Delivered, with a review link ───────────────────────────────────────────

function deliveredMail(
  order: Order,
  lines: MailLine[],
  origin: string,
  brand: { name: string; longName: string; logo: string },
  contact: { phone: string; whatsapp: string },
) {
  const first = order.customer_name.split(/\s+/)[0] || order.customer_name;
  const review = `${origin}/review/${order.id}`;
  const wa = realWhatsApp(contact.whatsapp) ? `https://wa.me/${contact.whatsapp}` : "";
  const shop = brand.longName || brand.name;
  const watch = lines.find((l) => l.kind === "watch")?.name;

  const body = `${header(origin, brand.logo, brand.name)}
<tr><td style="padding:16px 32px 0">
<p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${GOLD}">Order #${order.number} · Delivered</p>
<h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:700">It's with you, ${esc(first)}.</h1>
<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:${MUTE}">Your order has been delivered${watch ? ` — enjoy the <strong style="color:${INK}">${esc(watch)}</strong>` : ""}. Thank you for buying from ${esc(shop)}.</p>
</td></tr>
<tr><td style="padding:20px 32px 0">${itemsTable(origin, lines)}</td></tr>
<tr><td style="padding:24px 32px 0">
<p style="margin:0;font-size:15px;line-height:1.6;font-weight:600">How did it land?</p>
<p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:${MUTE}">A few lines about the watch, the strap or the delivery help the next person decide — and they mean a lot to us. It takes a minute.</p>
</td></tr>
<tr><td style="padding:20px 32px 32px">${button(review, "Leave a review")}</td></tr>`;

  const footer = [
    `Anything not right? Reply to this email${wa ? ` or <a href="${wa}" style="color:${MUTE}">message us on WhatsApp</a>` : ""} and we will sort it.`,
    esc(shop),
  ].join("<br>");

  const text = [
    `It's with you, ${first}.`,
    ``,
    `Order #${order.number} has been delivered${watch ? ` — enjoy the ${watch}` : ""}. Thank you for buying from ${shop}.`,
    ``,
    textLines(lines),
    ``,
    `How did it land? Leave a review — it takes a minute:`,
    review,
    ``,
    `Anything not right? Reply to this email${wa ? ` or message us on WhatsApp: ${wa}` : ""}.`,
    shop,
  ].join("\n");

  return {
    subject: `Delivered — your ${brand.name} order #${order.number}`,
    html: shell(`Order #${order.number} delivered`, `Your order has been delivered — tell us how it landed`, body, footer),
    text,
  };
}

/**
 * Tells the customer their order has been delivered and asks for a review.
 * Sent from the dashboard when an order is marked delivered and the owner
 * says yes. Returns what happened, for the dashboard to show; never throws.
 */
export async function sendDeliveredEmail(
  orderId: string,
  origin: string,
): Promise<{ ok: true; to: string } | { ok: false; error: string }> {
  try {
    const found = await getOrder(orderId);
    if (!found) return { ok: false, error: "Order not found." };
    const { order, items } = found;
    if (!order.email) return { ok: false, error: "This order has no customer email." };

    const [cfg, { brand, contact }] = await Promise.all([getOrderEmails(), getSettings()]);
    const from = { name: cfg.fromName || brand.longName || brand.name, email: cfg.fromEmail };
    if (!from.email) return { ok: false, error: "Set a sender under Settings → Order emails first." };
    const shopInbox = notifyList(cfg);

    const lines: MailLine[] = items.map((i) => ({
      name: i.name,
      qty: i.qty,
      unit_price: i.unit_price,
      image: i.image,
      kind: i.kind,
    }));
    const m = deliveredMail(order, lines, origin, brand, contact);
    const r = await sendMail({
      from,
      to: [{ email: order.email, name: order.customer_name }],
      replyTo: { email: shopInbox[0] ?? from.email, name: from.name },
      subject: m.subject,
      html: m.html,
      text: m.text,
      tags: ["order-delivered"],
    });
    await note(order.id, outcome(r, `Delivery email with a review link sent to ${order.email}`));
    return r.ok ? { ok: true, to: order.email } : { ok: false, error: r.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "The email could not be sent." };
  }
}
