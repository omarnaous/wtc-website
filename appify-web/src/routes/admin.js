// /admin: the booking requests from the "Book a call" form, newest first, with a status per request
// (new, contacted, won, lost). One password (the Worker secret ADMIN_PASSWORD); signing in sets a signed, HttpOnly
// cookie for 30 days. Nothing here is cached or indexed.
import { esc, json as parseList, ASSET_V } from "../lib/html.js";

const COOKIE = "appify_admin", DAYS = 30;
const STATUSES = ["new", "contacted", "won", "lost"];
const enc = new TextEncoder();
const NO_STORE = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "x-frame-options": "DENY" };
const html = (body, status = 200, headers = {}) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...NO_STORE, ...headers } });
const redirect = (to, headers = {}) => new Response(null, { status: 303, headers: { location: to, ...NO_STORE, ...headers } });

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
// constant-time string comparison (both sides hashed first, so lengths match)
async function same(a, b) {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest("SHA-256", enc.encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0; for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}
const cookieOf = (request) => Object.fromEntries((request.headers.get("cookie") || "").split(/;\s*/).filter(Boolean).map((c) => [c.slice(0, c.indexOf("=")), c.slice(c.indexOf("=") + 1)]));
async function signedIn(request, env) {
  const v = cookieOf(request)[COOKIE]; if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, await hmac(env.ADMIN_PASSWORD, `admin:${exp}`));
}
const ipHash = async (request) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode("admin:" + (request.headers.get("cf-connecting-ip") || ""))))].slice(0, 12).map((x) => x.toString(16).padStart(2, "0")).join("");
// form posts must come from this site (the cookie is also SameSite=Strict)
const sameOrigin = (request) => { const o = request.headers.get("origin"); return !o || o === new URL(request.url).origin; };

export async function handleAdmin(request, env) {
  const url = new URL(request.url), p = url.pathname.replace(/\/+$/, "") || "/admin";
  if (!env.ADMIN_PASSWORD) return html(shell("Admin", `<main class="box"><h1>Admin isn't set up yet</h1><p>Add the Worker secret <code>ADMIN_PASSWORD</code> in Cloudflare, then reload.</p></main>`), 503);
  if (request.method === "POST" && !sameOrigin(request)) return html("Forbidden", 403);

  if (p === "/admin/login" && request.method === "POST") {
    const ip = await ipHash(request);
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_attempts WHERE ip_hash = ? AND created_at > datetime('now', '-15 minutes')").bind(ip).first();
    if ((recent?.n || 0) >= 8) return html(login("Too many tries. Wait 15 minutes."), 429);
    const f = await request.formData().catch(() => null);
    if (!(await same(String(f?.get("password") || ""), env.ADMIN_PASSWORD))) {
      await env.DB.prepare("INSERT INTO admin_attempts (ip_hash) VALUES (?)").bind(ip).run();
      return html(login("Wrong password."), 401);
    }
    const exp = Date.now() + DAYS * 864e5;
    return redirect("/admin", { "set-cookie": `${COOKIE}=${exp}.${await hmac(env.ADMIN_PASSWORD, `admin:${exp}`)}; Path=/admin; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Strict` });
  }
  if (!(await signedIn(request, env))) return request.method === "GET" ? html(login()) : redirect("/admin");

  if (p === "/admin/logout" && request.method === "POST") return redirect("/admin", { "set-cookie": `${COOKIE}=; Path=/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  const m = p.match(/^\/admin\/bookings\/(\d+)$/);
  if (m && request.method === "POST") {
    const f = await request.formData().catch(() => null), status = String(f?.get("status") || "");
    if (STATUSES.includes(status)) await env.DB.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind(status, Number(m[1])).run();
    return redirect(`/admin${f?.get("back") ? `?status=${encodeURIComponent(f.get("back"))}` : ""}#b${m[1]}`);
  }
  if (p === "/admin" && request.method === "GET") return html(await list(env, url.searchParams.get("status") || ""));
  return html(shell("Not found", `<main class="box"><h1>Not found</h1><p><a href="/admin">Back to requests</a></p></main>`), 404);
}

// ── pages ────────────────────────────────────────────────────────────────────────────────────────────
const shell = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark light"><title>${esc(title)} | Appify admin</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/css/site.css?v=${ASSET_V}"><style>${CSS}</style></head><body class="admin">${body}</body></html>`;

const login = (error = "") => shell("Sign in", `<main class="box"><p class="eyebrow">Appify admin</p><h1>Sign in</h1>
<form method="post" action="/admin/login" class="login"><label><span>Password</span><input class="field" type="password" name="password" autocomplete="current-password" required autofocus></label>
${error ? `<p class="err">${esc(error)}</p>` : ""}<button class="btn primary" type="submit">Sign in</button></form></main>`);

const beirut = (sqlUtc) => new Date(sqlUtc.replace(" ", "T") + "Z").toLocaleString("en-GB", { timeZone: "Asia/Beirut", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const prettyDay = (d) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d; return new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }); };
const digits = (phone) => phone.replace(/[^\d]/g, "").replace(/^00/, "");

async function list(env, filter) {
  const all = (await env.DB.prepare("SELECT id, created_at, name, phone, email, services, day, time, message, channel, status FROM bookings ORDER BY id DESC LIMIT 500").all()).results;
  const counts = Object.fromEntries(STATUSES.map((s) => [s, all.filter((b) => b.status === s).length]));
  const rows = STATUSES.includes(filter) ? all.filter((b) => b.status === filter) : all;
  const tab = (s, label, n) => `<a class="tab${filter === s ? " on" : ""}" href="/admin${s ? `?status=${s}` : ""}">${label} <b>${n}</b></a>`;
  const card = (b) => {
    const services = parseList(b.services), wa = digits(b.phone || "");
    return `<article class="req s-${esc(b.status)}" id="b${b.id}">
  <header><div><h2>${esc(b.name)}</h2><p class="meta">#${b.id} · ${esc(beirut(b.created_at))} · sent by ${b.channel === "whatsapp" ? "WhatsApp" : "email"}</p></div><span class="pill">${esc(b.status)}</span></header>
  ${b.day || b.time ? `<p class="when">${esc([prettyDay(b.day), b.time].filter(Boolean).join(" at "))}</p>` : ""}
  ${services.length ? `<p class="tags">${services.map((s) => `<span>${esc(s)}</span>`).join("")}</p>` : ""}
  ${b.message ? `<p class="msg">${esc(b.message)}</p>` : ""}
  <div class="contact">
    ${b.phone ? `<a class="btn sm" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp ${esc(b.phone)}</a><a class="btn sm ghost" href="tel:${esc(b.phone)}">Call</a>` : ""}
    ${b.email ? `<a class="btn sm ghost" href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : ""}
  </div>
  <form method="post" action="/admin/bookings/${b.id}" class="set"><input type="hidden" name="back" value="${esc(filter)}">
    ${STATUSES.map((s) => `<button class="chip${b.status === s ? " on" : ""}" name="status" value="${s}" type="submit">${s}</button>`).join("")}
  </form>
</article>`;
  };
  return shell("Requests", `<main class="wrap admin-in">
  <header class="top"><div><p class="eyebrow">Appify admin</p><h1>Booking requests</h1></div><form method="post" action="/admin/logout"><button class="btn sm ghost" type="submit">Sign out</button></form></header>
  <nav class="tabs">${tab("", "All", all.length)}${tab("new", "New", counts.new)}${tab("contacted", "Contacted", counts.contacted)}${tab("won", "Won", counts.won)}${tab("lost", "Lost", counts.lost)}</nav>
  ${rows.length ? `<div class="reqs">${rows.map(card).join("")}</div>` : `<p class="empty">No requests here yet.</p>`}
</main>`);
}

const CSS = `
body.admin { min-height: 100vh; background: var(--bg); }
.box { max-width: 420px; margin: 12vh auto; padding: 0 var(--pad); display: grid; gap: 14px; }
.box h1, .top h1 { font: 600 clamp(30px, 4vw, 44px)/1.05 "Display"; letter-spacing: -.035em; }
.login { display: grid; gap: 14px; margin-top: 8px; } .login label { display: grid; gap: 8px; font-weight: 600; }
.err { color: var(--alert); font-weight: 600; }
.admin-in { padding-top: 40px; padding-bottom: 80px; }
.top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; }
.tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
.tab { padding: 9px 14px; border-radius: 99px; border: 1.5px solid rgba(var(--fg-rgb), .16); font-weight: 600; font-size: 14px; }
.tab b { margin-left: 4px; color: var(--dim); } .tab.on { background: var(--uv); border-color: transparent; color: #fff; } .tab.on b { color: rgba(255,255,255,.75); }
.reqs { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); gap: 16px; }
.req { display: grid; gap: 12px; align-content: start; padding: 20px; border-radius: 20px; background: var(--surface); border: 1px solid var(--line); }
.req.s-new { border-color: rgba(91, 43, 255, .6); }
.req header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.req h2 { font: 600 22px/1.15 "Display"; letter-spacing: -.02em; }
.req .meta { margin-top: 6px; }
.pill { padding: 5px 10px; border-radius: 99px; font: 500 11px/1 "Mono", monospace; letter-spacing: .1em; text-transform: uppercase; background: rgba(var(--fg-rgb), .08); color: var(--mute); }
.s-new .pill { background: var(--uv); color: #fff; } .s-won .pill { background: rgba(57, 226, 155, .18); color: var(--green); } .s-lost .pill { color: var(--dim); }
.when { font-weight: 600; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; } .tags span { padding: 5px 10px; border-radius: 99px; background: rgba(91, 43, 255, .14); color: var(--iris); font-size: 13px; font-weight: 600; }
.msg { color: var(--mute); white-space: pre-wrap; overflow-wrap: anywhere; }
.contact { display: flex; flex-wrap: wrap; gap: 8px; } .btn.sm { padding: 9px 14px; font-size: 13.5px; }
.set { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 12px; border-top: 1px dashed var(--line); }
.chip { padding: 7px 12px; border-radius: 99px; border: 1.5px solid rgba(var(--fg-rgb), .16); font: 600 13px/1 "UI"; text-transform: capitalize; cursor: pointer; }
.chip.on { background: rgba(var(--fg-rgb), .9); color: var(--bg); border-color: transparent; }
.empty { color: var(--mute); padding: 40px 0; }
`;
