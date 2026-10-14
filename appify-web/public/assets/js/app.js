// Motion and interaction on top of the server-rendered page. Everything degrades: without this script
// the content, links, videos (poster + tap to play) and the booking form (plain POST) still work.
import { devSVG } from "./dev.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;

// ── nav: solid on scroll, hides when scrolling down, mobile menu, scroll progress ───────────────────
const nav = $("[data-nav]"), bar = $(".progress");
let lastY = 0;
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav?.classList.toggle("scrolled", y > 20);
  nav?.classList.toggle("hide", y > 400 && y > lastY && !nav.classList.contains("open"));
  bar?.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
  lastY = y;
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();
$("[data-burger]")?.addEventListener("click", (e) => {
  const open = nav.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
$$("[data-mobile-menu] a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
$$(".nav-more").forEach((d) => document.addEventListener("click", (e) => { if (!d.contains(e.target)) d.open = false; }));

// ── split headlines into words, reveal on scroll ────────────────────────────────────────────────────
$$("[data-split]").forEach((el) => {
  let i = 0;
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const s = document.createElement("span"); s.className = "w"; s.style.setProperty("--i", i++); s.textContent = part; frag.append(s);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) walk(n);
  });
  walk(el);
  el.setAttribute("data-reveal", "");
});
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
$$("[data-reveal]").forEach((el) => io.observe(el));

// ── pointer glow in the hero, glow on service cards, tilt on cards, magnetic buttons ──────────────────
const hero = $("[data-hero]");
if (hero && fine && !reduced) hero.addEventListener("pointermove", (e) => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  hero.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
});
$$(".svc").forEach((c) => c.addEventListener("pointermove", (e) => {
  const r = c.getBoundingClientRect();
  c.style.setProperty("--x", `${e.clientX - r.left}px`); c.style.setProperty("--y", `${e.clientY - r.top}px`);
}));
if (fine && !reduced) {
  $$("[data-tilt]").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty("--ry", `${x * 6}deg`); c.style.setProperty("--rx", `${-y * 6}deg`);
    });
    c.addEventListener("pointerleave", () => { c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); });
  });
  $$(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });
}

// ── videos: load when near, play muted while visible, hover-play on desktop; modal with sound ─────────
const vids = $$("video[data-src]");
const load = (v) => { if (!v.src) { v.src = v.dataset.src; v.load(); } };
const vio = new IntersectionObserver((es) => es.forEach((e) => {
  const v = e.target;
  if (e.isIntersecting) { load(v); if (!reduced) v.play().catch(() => {}); } else if (!v.paused) v.pause();
}), { rootMargin: "200px 0px", threshold: 0.35 });
vids.forEach((v) => vio.observe(v));

const player = $("[data-player]"), pv = player?.querySelector("video");
$$("[data-play]").forEach((b) => b.addEventListener("click", (e) => {
  e.preventDefault();
  if (!player?.showModal) { location.href = b.dataset.play; return; }
  pv.src = b.dataset.play; player.querySelector(".player-title").textContent = b.dataset.title || "";
  player.showModal(); pv.currentTime = 0; pv.muted = false; pv.play().catch(() => {});
}));
const closePlayer = () => { pv?.pause(); player?.close(); };
player?.querySelector("[data-close]")?.addEventListener("click", closePlayer);
player?.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
player?.addEventListener("close", () => pv?.pause());

// ── filters (websites, videos) ─────────────────────────────────────────────────────────────────────
$$("[data-filter]").forEach((group) => {
  const items = $$(group.dataset.filter);
  group.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", group).forEach((x) => x.classList.toggle("on", x === b));
    const f = b.dataset.f;
    items.forEach((it) => {
      const keys = (it.dataset.cats || it.dataset.kind || "").split(" ");
      it.classList.toggle("out", f !== "*" && !keys.includes(f));
    });
  });
});

// ── the reel row: arrow buttons and drag to scroll ─────────────────────────────────────────────────
const row = $("[data-reel-row]");
if (row) {
  $$("[data-scroll]").forEach((b) => b.addEventListener("click", () => row.scrollBy({ left: Number(b.dataset.scroll) * row.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" })));
  let down = null, moved = false;
  row.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = { x: e.clientX, l: row.scrollLeft }; moved = false; });
  addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 6) { moved = true; row.classList.add("drag"); } row.scrollLeft = down.l - dx; });
  addEventListener("pointerup", () => { down = null; row.classList.remove("drag"); });
  row.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
}

// ── Dev, live: breathes, blinks, looks at the cursor, talks, and does tricks when tapped ────────────────
const stage = $("[data-dev]");
if (stage) {
  const btn = $(".dev-btn", stage), bubble = $(".dev-bubble", stage);
  const lines = JSON.parse(stage.dataset.lines || "[]");
  const s = { t0: performance.now(), look: 0, lookT: 0, tilt: 0, tiltT: 0, line: 0, said: lines[0] || "", sayAt: 0.3, nextBlink: 2, blinkAt: -1, act: null, actAt: -9, visible: true };
  const now = () => (performance.now() - s.t0) / 1000;
  const ACT = { wave: 1.8, jump: 0.6, thumbs: 1.6, point: 1.6, happy: 1.4, shock: 1.0, wink: 0.8 };
  const smooth = (x) => x * x * (3 - 2 * x);
  const env = (t, a, len, r = 0.18) => (t < a || t > a + len ? 0 : smooth(Math.min(1, (t - a) / r, (a + len - t) / r)));
  const say = (txt) => { s.said = txt; s.sayAt = now(); };
  const play = (a) => { s.act = a; s.actAt = now(); };
  addEventListener("pointermove", (e) => {
    const r = btn.getBoundingClientRect();
    s.lookT = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
    s.tiltT = s.lookT * 3 + Math.max(-1, Math.min(1, (e.clientY - r.top) / innerHeight)) * 1.5;
  }, { passive: true });
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; }).observe(stage);
  const tricks = ["jump", "thumbs", "wink", "shock", "happy", "wave"];
  let trick = 0;
  btn.addEventListener("click", (e) => {
    const a = tricks[trick++ % tricks.length]; play(a); if (a === "jump" || a === "happy") confetti(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    s.line = (s.line + 1) % lines.length; say(lines[s.line]);
  });
  const svgBox = btn;
  const frame = () => {
    const t = now();
    if (s.visible) {
      if (lines.length > 1 && t - s.sayAt > 4.6) { s.line = (s.line + 1) % lines.length; say(lines[s.line]); play(["point", "thumbs", "happy", "wave"][s.line % 4]); }
      if (t > s.nextBlink) { s.blinkAt = t; s.nextBlink = t + 2.2 + Math.random() * 2.6; }
      s.look += (s.lookT - s.look) * 0.12; s.tilt += (s.tiltT - s.tilt) * 0.08;
      const a = (k) => (s.act === k ? env(t, s.actAt, ACT[k]) : 0) + (k === "wave" && t < 2.4 ? env(t, 0.2, 2.2) : 0);
      const typed = s.said.slice(0, Math.max(0, Math.floor((t - s.sayAt) * 30)));
      const talking = typed.length < s.said.length;
      bubble.textContent = typed || " "; bubble.classList.toggle("typing", talking);
      const open = talking ? 0.25 + 0.5 * Math.abs(Math.sin(t * 17)) : 0;
      const bt = t - s.blinkAt, blink = bt >= 0 && bt < 0.14 ? Math.sin((bt / 0.14) * Math.PI) : 0;
      const jumpE = s.act === "jump" && t - s.actAt < ACT.jump ? Math.sin(((t - s.actAt) / ACT.jump) * Math.PI) : 0;
      const happy = Math.max(a("happy"), 0), wave = Math.min(1, a("wave"));
      svgBox.style.transform = `translateY(${-jumpE * 60}px)`;
      svgBox.innerHTML = devSVG({
        wave, waveAng: Math.sin(t * 9) * 18, point: Math.min(1, a("point")), thumbs: Math.min(1, a("thumbs")),
        tilt: s.tilt * 1.4, bob: Math.sin(t * 1.5) * 3 - open * 2,
        brow: 10 + 10 * a("thumbs") + 8 * a("point"), lid: Math.max(0.1 * (1 - happy), blink), smile: Math.max(0.8, happy),
        look: s.look * 9, shock: a("shock"), happy, wink: a("wink"), open,
      }, "Dev, the Appify mascot");
    }
    requestAnimationFrame(frame);
  };
  if (!reduced) requestAnimationFrame(frame);
  else bubble.textContent = lines[0] || "";
}
function confetti(x, y) {
  if (reduced) return;
  const colors = ["#5B2BFF", "#8F72FF", "#74C6FF", "#FFD23F", "#F3F1FA", "#F0384F"];
  for (let i = 0; i < 46; i++) {
    const c = document.createElement("i"); c.className = "confetti"; c.style.background = colors[i % colors.length];
    c.style.left = x + "px"; c.style.top = y + "px"; document.body.append(c);
    const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
    c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px, ${Math.sin(a) * v - 120 + 420}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
      { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => c.remove();
  }
}

// ── booking form: day chips, validation, save, then hand off to WhatsApp or email ───────────────────────
const form = $("[data-book]");
if (form) {
  const row = $("[data-days-row]", form), dayInput = $('input[name="day"]', form);
  const closed = JSON.parse(form.dataset.closed || "[0]"), n = Number(form.dataset.days || 14);
  const fmt = new Intl.DateTimeFormat("en", { weekday: "short" }), fmtM = new Intl.DateTimeFormat("en", { month: "short" });
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  for (let i = 1, added = 0; added < n && i < 40; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    if (closed.includes(d.getDay())) continue;
    const b = document.createElement("button"); b.type = "button"; b.className = "day"; b.dataset.day = iso(d);
    b.innerHTML = `<small>${fmt.format(d)}</small><b>${d.getDate()}</b><small>${fmtM.format(d)}</small>`;
    b.addEventListener("click", () => { $$(".day", row).forEach((x) => x.classList.toggle("on", x === b)); dayInput.value = b.dataset.day; });
    row.append(b); added++;
  }
  const msg = $(".form-msg", form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form), channel = e.submitter?.value || "email";
    const body = { ...Object.fromEntries(fd), services: fd.getAll("services"), channel };
    msg.className = "form-msg";
    if (!body.name?.trim()) { msg.textContent = "Please add your name."; msg.classList.add("err"); form.name.focus(); return; }
    if (!body.phone?.trim() && !body.email?.trim()) { msg.textContent = "Add a phone number or an email so we can reply."; msg.classList.add("err"); form.phone.focus(); return; }
    msg.textContent = "Sending…";
    $$(".send .btn", form).forEach((b) => (b.disabled = true));
    try {
      const r = await fetch(form.action, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Something went wrong.");
      msg.textContent = channel === "whatsapp" ? "Saved! Opening WhatsApp with your request…" : "Saved! Opening your email app with your request…";
      msg.classList.add("ok");
      confetti(innerWidth / 2, innerHeight * 0.6);
      setTimeout(() => { location.href = j.url; }, 700);
    } catch (err) {
      msg.textContent = err.message; msg.classList.add("err");
    } finally { $$(".send .btn", form).forEach((b) => (b.disabled = false)); }
  });
}

// nav highlight for the section in view
const links = $$('.nav-links > a[href^="/#"]');
const secs = links.map((a) => document.getElementById(a.getAttribute("href").slice(2))).filter(Boolean);
if (secs.length) {
  const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "/#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach((s) => sio.observe(s));
}
