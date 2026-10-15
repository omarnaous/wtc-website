// Worker entry for www.appify-lb.com. Files in public/ are served straight from Workers static assets (with the
// headers in public/_headers); every other request lands here: the booking API, or a server-rendered page.
import { renderPage } from "./routes/page.js";
import { createBooking } from "./routes/bookings.js";

// _headers only applies to static files, so the worker adds the same security headers to its own responses.
const SECURITY = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};
const secure = (res) => {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY)) if (!out.headers.has(k)) out.headers.set(k, v);
  return out;
};
const methodNotAllowed = (allow) => new Response("Method not allowed", { status: 405, headers: { allow, "cache-control": "no-store" } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // one canonical host: the bare domain redirects to SITE_URL's host (www)
    const canon = env.SITE_URL ? new URL(env.SITE_URL) : null;
    if (canon && url.hostname !== canon.hostname && url.hostname === canon.hostname.replace(/^www\./, "")) {
      return Response.redirect(`${canon.origin}${url.pathname}${url.search}`, 301);
    }

    if (url.pathname === "/api/bookings") {
      return secure(request.method === "POST" ? await createBooking(request, env) : methodNotAllowed("POST"));
    }
    if (request.method === "GET") return secure(await renderPage(request, env, ctx));
    if (request.method === "HEAD") {
      const res = await renderPage(new Request(request, { method: "GET" }), env, ctx);
      return secure(new Response(null, res));
    }
    return methodNotAllowed("GET, HEAD");
  },
};
