// POST /api/bookings: saves the appointment request in D1, emails it to Appify (Brevo, when BREVO_API_KEY is set),
// then hands back the WhatsApp or email link the visitor sends it with. Works with fetch (JSON) and with a plain form
// post (no JavaScript).
import { loadSite } from "../lib/data.js";

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function createBooking(request, env) {
  const isJSON = (request.headers.get("content-type") || "").includes("application/json");
  let b = {};
  if (isJSON) b = await request.json().catch(() => ({}));
  else {
    const f = await request.formData().catch(() => null); // text/plain or a broken body: treat as empty
    if (f) { b = Object.fromEntries(f); b.services = f.getAll("services"); }
  }
  if (!b || typeof b !== "object" || Array.isArray(b)) b = {};
  if (b.website) return json({ ok: true });                                   // honeypot: quietly accept bots
  const d = {
    name: clip(b.name, 80), phone: clip(b.phone, 30), email: clip(b.email, 120), message: clip(b.message, 1200),
    day: clip(b.day, 20), time: clip(b.time, 10), channel: b.channel === "email" ? "email" : "whatsapp",
    services: (Array.isArray(b.services) ? b.services : [b.services]).filter(Boolean).map((s) => clip(s, 40)).slice(0, 8),
  };
  if (!d.name) return json({ ok: false, error: "Please add your name." }, 400);
  if (!d.phone && !d.email) return json({ ok: false, error: "Add a phone number or an email so we can reply." }, 400);
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json({ ok: false, error: "That email doesn't look right." }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "";
  const ipHash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + (env.HASH_SALT || "appify"))))].slice(0, 12).map((x) => x.toString(16).padStart(2, "0")).join("");
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM bookings WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')").bind(ipHash).first();
  if ((recent?.n || 0) >= 5) return json({ ok: false, error: "Too many requests. Try again in a few minutes." }, 429);

  const r = await env.DB.prepare("INSERT INTO bookings (name, phone, email, services, day, time, message, channel, ip_hash, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(d.name, d.phone, d.email, JSON.stringify(d.services), d.day, d.time, d.message, d.channel, ipHash, clip(request.headers.get("user-agent"), 200)).run();

  const site = await loadSite(env, new URL(request.url).origin);
  const s = site.settings;
  const lines = [
    "Hi Appify! I'd like to book a call.", "",
    `Name: ${d.name}`,
    d.phone ? `Phone: ${d.phone}` : null,
    d.email ? `Email: ${d.email}` : null,
    d.services.length ? `Interested in: ${d.services.join(", ")}` : null,
    d.day || d.time ? `Preferred time: ${[d.day, d.time].filter(Boolean).join(" at ")}` : null,
    d.message ? `\n${d.message}` : null,
    "", `Request #${r.meta?.last_row_id ?? ""}`,
  ].filter((l) => l !== null);
  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n");
  await notify(env, s, d, text, r.meta?.last_row_id);
  const whatsappUrl = s.whatsapp ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(text)}` : null;
  const mailtoUrl = `mailto:${s.email}?subject=${encodeURIComponent(`Booking request: ${d.name}`)}&body=${encodeURIComponent(text)}`;
  const go = d.channel === "whatsapp" && whatsappUrl ? whatsappUrl : mailtoUrl;
  if (isJSON) return json({ ok: true, id: r.meta?.last_row_id, url: go, whatsappUrl, mailtoUrl });
  return new Response(null, { status: 303, headers: { location: go } });
}

// Emails each booking to Appify through Brevo's transactional API. Needs the Worker secret BREVO_API_KEY; the sender
// (MAIL_FROM, else the site email) must be a verified sender in Brevo. A failed email never fails the booking: the
// request is already saved in D1.
async function notify(env, s, d, text, id) {
  if (!env.BREVO_API_KEY || !s.email) return;
  const from = env.MAIL_FROM || s.email;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "Appify website", email: from },
        to: [{ email: s.email, name: "Appify" }],
        ...(d.email ? { replyTo: { email: d.email, name: d.name } } : {}),
        subject: `New booking #${id ?? ""}: ${d.name}${d.day ? ` (${[d.day, d.time].filter(Boolean).join(" at ")})` : ""}`,
        textContent: text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("brevo", res.status, (await res.text()).slice(0, 300));
  } catch (e) { console.error("brevo", e.message); }
}
