// POST /api/bookings: saves the appointment request in D1, then hands back the WhatsApp or email link
// the visitor sends it with. Works with fetch (JSON) and with a plain form post (no JavaScript).
import { loadSite } from "../_lib/data.js";

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  const isJSON = (request.headers.get("content-type") || "").includes("application/json");
  let b;
  if (isJSON) b = await request.json().catch(() => ({}));
  else { const f = await request.formData(); b = Object.fromEntries(f); b.services = f.getAll("services"); }
  if (b.website) return json({ ok: true });                                   // honeypot: quietly accept bots
  const d = {
    name: clip(b.name, 80), phone: clip(b.phone, 30), email: clip(b.email, 120), message: clip(b.message, 1200),
    day: clip(b.day, 20), time: clip(b.time, 10), channel: b.channel === "whatsapp" ? "whatsapp" : "email",
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
  const whatsappUrl = s.whatsapp ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(text)}` : null;
  const mailtoUrl = `mailto:${s.email}?subject=${encodeURIComponent(`Booking request: ${d.name}`)}&body=${encodeURIComponent(text)}`;
  const go = d.channel === "whatsapp" && whatsappUrl ? whatsappUrl : mailtoUrl;
  if (isJSON) return json({ ok: true, id: r.meta?.last_row_id, url: go, whatsappUrl, mailtoUrl });
  return new Response(null, { status: 303, headers: { location: go } });
}
