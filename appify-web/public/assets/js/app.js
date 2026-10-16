// Motion and interaction on top of the server-rendered page. Everything degrades: without this script
// the content, links, videos (poster + tap to play) and the booking form (plain POST) still work.
import { devSVG } from "./dev.js?v=20261016r";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
// Run a handler at most once per animation frame (pointer and scroll events fire far faster than the screen).
const perFrame = (fn) => { let q = false, last; return (e) => { last = e; if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(last); }); }; };

// ── nav: solid on scroll, hides when scrolling down, mobile menu, scroll progress ───────────────────
const nav = $("[data-nav]"), bar = $(".progress");
let lastY = 0, docH = 0;
const measure = () => { docH = document.documentElement.scrollHeight - innerHeight; };
const onScroll = () => {
  const y = scrollY;
  nav?.classList.toggle("scrolled", y > 20);
  nav?.classList.toggle("hide", y > 400 && y > lastY + 2 && !nav.classList.contains("open"));
  if (y < lastY - 2) nav?.classList.remove("hide");
  bar?.style.setProperty("--p", docH > 0 ? Math.min(1, y / docH).toFixed(4) : 0);
  lastY = y;
};
measure(); onScroll();
addEventListener("scroll", perFrame(onScroll), { passive: true });
addEventListener("resize", perFrame(() => { measure(); onScroll(); }));
new ResizeObserver(perFrame(measure)).observe(document.body);
$("[data-burger]")?.addEventListener("click", (e) => {
  const open = nav.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
$$("[data-mobile-menu] a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); $("[data-burger]")?.setAttribute("aria-expanded", "false"); }));
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
// After its entrance, an element drops the stagger delay so hover and other transitions respond at once.
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(() => t.style.setProperty("--d", "0ms"), 1400); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
// Cards in a horizontal row appear with the row (all at once, the first few staggered), so nothing fades in mid-swipe.
const rowIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  [...e.target.children].forEach((c, i) => { c.style.setProperty("--d", `${Math.min(i, 5) * 60}ms`); c.classList.add("in"); setTimeout(() => c.style.setProperty("--d", "0ms"), 1400); });
  rowIO.unobserve(e.target);
}), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
$$("[data-row]").forEach((r) => rowIO.observe(r));
$$("[data-reveal]").forEach((el) => { if (!el.parentElement.matches("[data-row]")) io.observe(el); });

// ── pointer glow in the hero, glow on service cards, tilt on cards, magnetic buttons ──────────────────
// The hero glow is a separate layer moved with transform (no full-screen repaint per mouse move).
const hero = $("[data-hero]"), spot = $(".hero-bg .spot");
if (hero && spot && fine && !reduced) hero.addEventListener("pointermove", perFrame((e) => {
  const r = hero.getBoundingClientRect();
  spot.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
}), { passive: true });
if (fine && !reduced) {
  $$(".svc").forEach((c) => c.addEventListener("pointermove", perFrame((e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--x", `${e.clientX - r.left}px`); c.style.setProperty("--y", `${e.clientY - r.top}px`);
  }), { passive: true }));
  $$("[data-tilt]").forEach((c) => {
    let on = false;
    c.addEventListener("pointermove", perFrame((e) => {
      if (!on) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`); c.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    }), { passive: true });
    c.addEventListener("pointerenter", () => { on = true; c.classList.add("tilting"); });
    c.addEventListener("pointerleave", () => { on = false; c.classList.remove("tilting"); c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); });
  });
  $$(".magnetic").forEach((b) => {
    let on = false;
    b.addEventListener("pointermove", perFrame((e) => {
      if (!on) return;
      const r = b.getBoundingClientRect();
      b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`;
    }), { passive: true });
    b.addEventListener("pointerenter", () => { on = true; });
    b.addEventListener("pointerleave", () => { on = false; b.style.translate = ""; });
  });
}

// ── videos: load when near, play muted while visible, hover-play on desktop; modal with sound ─────────
const vids = $$("video[data-src]"), onScreen = new Set();
const load = (v) => { if (!v.getAttribute("src")) { v.src = v.dataset.src; v.load(); } };
const vio = new IntersectionObserver((es) => es.forEach((e) => {
  const v = e.target;
  if (e.isIntersecting) { onScreen.add(v); load(v); if (!reduced && !document.hidden && !v.closest(".moving")) v.play().catch(() => {}); }
  else { onScreen.delete(v); if (!v.paused) v.pause(); }
}), { threshold: 0.6 });
vids.forEach((v) => vio.observe(v));
document.addEventListener("visibilitychange", () => onScreen.forEach((v) => (document.hidden ? v.pause() : !reduced && v.play().catch(() => {}))));

const player = $("[data-player]"), pv = player?.querySelector("video");
$$("[data-play]").forEach((b) => b.addEventListener("click", (e) => {
  e.preventDefault();
  if (!player?.showModal) { location.href = b.dataset.play; return; }
  onScreen.forEach((v) => v.pause());
  $$("[data-vcard].playing video").forEach((v) => { v.pause(); v.closest("[data-vcard]").classList.remove("playing"); });
  pv.src = b.dataset.play; player.querySelector(".player-title").textContent = b.dataset.title || "";
  player.showModal(); pv.muted = false; pv.play().catch(() => {});
}));
const closePlayer = () => player?.close();
player?.querySelector("[data-close]")?.addEventListener("click", closePlayer);
player?.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
player?.addEventListener("close", () => {
  pv.pause(); pv.removeAttribute("src"); pv.load(); // stop downloading the full video
  if (!reduced) onScreen.forEach((v) => v.play().catch(() => {}));
});

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
      if (!it.classList.contains("out")) it.classList.add("in");
    });
    const r = items[0]?.closest("[data-row]");
    if (r) { r.scrollTo({ left: 0, behavior: "auto" }); r.dispatchEvent(new Event("scroll")); }
  });
});

// ── horizontal rows: arrow buttons, drag to scroll, a progress line, arrows dim at the ends ───────────────
$$("[data-row]").forEach((row) => {
  const btns = row.id ? $$(`[data-for="${row.id}"]`) : [], prog = row.id ? $(`[data-prog-for="${row.id}"]`) : null;
  const cardsIn = () => [...row.children].filter((c) => c.offsetParent);
  btns.forEach((b) => b.addEventListener("click", () => {
    const cs = cardsIn(); if (cs.length < 2) return;
    const step = cs[1].offsetLeft - cs[0].offsetLeft, first = cs[0].offsetLeft;
    const perPage = Math.max(1, Math.floor((row.clientWidth - parseFloat(getComputedStyle(row).paddingLeft) * 2 + 18) / step));
    const at = Math.round((row.scrollLeft) / step), to = Math.max(0, Math.min(cs.length - 1, at + Number(b.dataset.scroll) * perPage));
    row.scrollTo({ left: Math.min(cs[to].offsetLeft - first, row.scrollWidth - row.clientWidth), behavior: reduced ? "auto" : "smooth" });
  }));
  // while the row moves, its preview videos pause (the decoder stays out of the way of the swipe)
  let moving = 0;
  const rest = () => { moving = 0; row.classList.remove("moving"); $$("video[data-src]", row).forEach((v) => onScreen.has(v) && !reduced && !document.hidden && v.play().catch(() => {})); };
  row.addEventListener("scroll", () => {
    if (!moving) { row.classList.add("moving"); $$("video[data-src]", row).forEach((v) => !v.paused && v.pause()); }
    clearTimeout(moving); moving = setTimeout(rest, 180);
  }, { passive: true });
  const update = () => {
    const max = row.scrollWidth - row.clientWidth, x = row.scrollLeft;
    btns.forEach((b) => { b.disabled = Number(b.dataset.scroll) < 0 ? x <= 2 : x >= max - 2; });
    prog?.style.setProperty("--w", (row.clientWidth / row.scrollWidth).toFixed(3));
    prog?.style.setProperty("--p", max > 0 ? (x / max).toFixed(3) : "0");
    const fits = max <= 2; // everything visible: no arrows, no progress line
    btns[0]?.parentElement.classList.toggle("is-hidden", fits); prog?.classList.toggle("is-hidden", fits);
  };
  row.addEventListener("scroll", perFrame(update), { passive: true });
  new ResizeObserver(perFrame(update)).observe(row); update();
  let down = null, moved = false;
  row.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || e.target.closest("button, a")) return; down = { x: e.clientX, l: row.scrollLeft }; moved = false; });
  addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 6) { moved = true; row.classList.add("drag"); } row.scrollLeft = down.l - dx; }, { passive: true });
  addEventListener("pointerup", () => { if (!down) return; down = null; row.classList.remove("drag"); });
  row.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
});

// ── website cards: tap the play button to play the full video in place, with sound ───────────────────────
const cards = $$("[data-vcard]");
const stopCard = (m) => { const v = $("video", m); if (!v.paused) v.pause(); m.classList.remove("playing"); };
cards.forEach((m) => {
  const v = $("video", m), bar = $(".vbar", m);
  $(".vtap", m).addEventListener("click", () => {
    cards.forEach((o) => o !== m && stopCard(o));
    onScreen.forEach((o) => o.pause());
    if (!v.getAttribute("src")) { v.src = v.dataset.full; }
    v.muted = false; m.classList.add("playing", "loading");
    v.play().catch(() => m.classList.remove("playing", "loading"));
  });
  v.addEventListener("playing", () => m.classList.remove("loading"));
  v.addEventListener("click", () => (v.paused ? $(".vtap", m).click() : stopCard(m)));
  v.addEventListener("ended", () => { stopCard(m); v.currentTime = 0; });
  v.addEventListener("timeupdate", () => bar.style.setProperty("--t", v.duration ? (v.currentTime / v.duration).toFixed(3) : 0));
});
if (cards.length) {
  const cio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) stopCard(e.target); }), { threshold: 0.2 });
  cards.forEach((m) => cio.observe(m));
  document.addEventListener("visibilitychange", () => document.hidden && cards.forEach(stopCard));
}

// ── Dev, live: breathes, blinks, looks at the cursor, talks, and does tricks when tapped ────────────────
// Cheap by design: the body bob and the jump are a CSS transform on the button; the SVG is only rebuilt when
// the pose actually changes (rounded), at most 30 times a second, and nothing runs while Dev is off screen.
const stage = $("[data-dev]");
if (stage) {
  const btn = $(".dev-btn", stage), bubble = $(".dev-bubble", stage);
  const lines = JSON.parse(stage.dataset.lines || "[]");
  const s = { t0: performance.now(), look: 0, lookT: 0, tilt: 0, tiltT: 0, line: 0, said: lines[0] || "", sayAt: 0.3, nextBlink: 2, blinkAt: -1, act: null, actAt: -9, visible: true, px: null, py: null };
  const now = () => (performance.now() - s.t0) / 1000;
  const ACT = { wave: 1.8, jump: 0.6, thumbs: 1.6, point: 1.6, happy: 1.4, shock: 1.0, wink: 0.8 };
  const smooth = (x) => x * x * (3 - 2 * x);
  const env = (t, a, len, r = 0.18) => (t < a || t > a + len ? 0 : smooth(Math.min(1, (t - a) / r, (a + len - t) / r)));
  const q = (x, step) => Math.round(x / step) * step;
  const say = (txt) => { s.said = txt; s.sayAt = now(); };
  const play = (a) => { s.act = a; s.actAt = now(); };
  if (fine) addEventListener("pointermove", (e) => { s.px = e.clientX; s.py = e.clientY; }, { passive: true });
  // while the page is scrolling, Dev holds his pose so every frame goes to the scroll
  let scrollingUntil = 0;
  addEventListener("scroll", () => { scrollingUntil = performance.now() + 180; }, { passive: true });
  const tricks = ["jump", "thumbs", "wink", "shock", "happy", "wave"];
  let trick = 0, raf = 0, lastDraw = 0, lastKey = "", lastText = null, lastTyping = null, lastFull = null;
  // two layers in one grid cell: the full line (hidden) sizes the bubble, so typing never resizes it
  bubble.innerHTML = '<span class="full" aria-hidden="true"></span><span class="typed"></span>';
  const full = bubble.firstChild, typedEl = bubble.lastChild;
  full.textContent = lastFull = s.said; // keep the server-rendered size from the first frame
  btn.addEventListener("click", (e) => {
    const a = tricks[trick++ % tricks.length]; play(a); if (a === "jump" || a === "happy") confetti(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    s.line = (s.line + 1) % lines.length; say(lines[s.line]);
  });
  // The intro screen next to Dev: plays muted; one tap turns the sound on in place. Dev dances while it plays
  // and points to booking at the end (the screen shows a Book a call card).
  const body = $(".dev-body", stage), tv = $("[data-tv]"), tvV = tv && $("video", tv);
  let dancing = false;
  if (tv) {
    const bar = $(".tv-bar i", tv);
    $(".tv-hit", tv).addEventListener("click", () => {
      if (!tv.classList.contains("sound")) {
        tv.classList.add("sound"); tvV.loop = false; tvV.src = tv.dataset.full; tvV.muted = false;
        tvV.play().catch(() => {}); say("Turn it up!"); play("happy");
      } else if (tvV.paused) tvV.play().catch(() => {});
      else tvV.pause();
    });
    tvV.addEventListener("play", () => { tv.classList.remove("paused", "ended"); dancing = tv.classList.contains("sound"); });
    tvV.addEventListener("pause", () => { if (tv.classList.contains("sound") && !tvV.ended) tv.classList.add("paused"); dancing = false; });
    tvV.addEventListener("timeupdate", () => { if (tvV.duration) bar.style.setProperty("--p", (tvV.currentTime / tvV.duration).toFixed(3)); });
    tvV.addEventListener("ended", () => { tv.classList.add("ended"); tv.classList.remove("paused"); dancing = false; say("Your turn. Book a call!"); play("point"); });
    $(".tv-again", tv).addEventListener("click", () => { tvV.currentTime = 0; tvV.play().catch(() => {}); });
  }
  if (fine) $("[data-hero-cta]")?.addEventListener("pointerenter", () => { say("Good call!"); play("thumbs"); });
  const frame = (ms) => {
    raf = 0;
    if (!s.visible || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (ms - lastDraw < 32 || ms < scrollingUntil) return; // ~30 fps is plenty for a cartoon; none while scrolling
    lastDraw = ms;
    const t = now();
    if (!dancing && lines.length > 1 && t - s.sayAt > 4.6) { s.line = (s.line + 1) % lines.length; say(lines[s.line]); play(["happy", "wink"][s.line % 2]); } // face-only, so the tablet stays in his hands
    if (t > s.nextBlink) { s.blinkAt = t; s.nextBlink = t + 2.2 + Math.random() * 2.6; }
    if (s.px !== null) {
      const r = btn.getBoundingClientRect();
      s.lookT = Math.max(-1, Math.min(1, (s.px - (r.left + r.width / 2)) / (innerWidth / 2)));
      s.tiltT = s.lookT * 3 + Math.max(-1, Math.min(1, (s.py - r.top) / innerHeight)) * 1.5;
    }
    if (dancing) s.tiltT = Math.sin(t * Math.PI * 2) * 6;
    s.look += (s.lookT - s.look) * 0.2; s.tilt += (s.tiltT - s.tilt) * 0.14;
    const a = (k) => (s.act === k ? env(t, s.actAt, ACT[k]) : 0) + (k === "wave" && t < 2.4 ? env(t, 0.2, 2.2) : 0);
    const typed = s.said.slice(0, Math.max(0, Math.floor((t - s.sayAt) * 30)));
    const talking = typed.length < s.said.length;
    if (s.said !== lastFull) { full.textContent = lastFull = s.said; }
    if (typed !== lastText) { typedEl.textContent = typed; lastText = typed; }
    if (talking !== lastTyping) { bubble.classList.toggle("typing", talking); lastTyping = talking; }
    const open = talking ? 0.25 + 0.5 * Math.abs(Math.sin(t * 17)) : 0;
    const bt = t - s.blinkAt, blink = bt >= 0 && bt < 0.14 ? Math.sin((bt / 0.14) * Math.PI) : 0;
    const jumpE = s.act === "jump" && t - s.actAt < ACT.jump ? Math.sin(((t - s.actAt) / ACT.jump) * Math.PI) : 0;
    const bounce = dancing ? Math.abs(Math.sin(t * Math.PI * 2)) * 14 : 0; // two bounces a second, to the music
    body.style.transform = `translate3d(0, ${(Math.sin(t * 1.5) * 3 - open * 2 - jumpE * 60 - bounce).toFixed(1)}px, 0)`;
    const happy = Math.max(a("happy"), dancing ? 0.7 : 0), wave = Math.min(1, a("wave"));
    const pose = {
      wave: q(wave, 0.05), waveAng: wave > 0.01 ? q(Math.sin(t * 9) * 18, 1) : 0, point: q(Math.min(1, a("point")), 0.05), thumbs: q(Math.min(1, a("thumbs")), 0.05),
      tilt: q(s.tilt * 1.4, 0.25), brow: q(10 + 10 * a("thumbs") + 8 * a("point"), 0.5), lid: q(Math.max(0.1 * (1 - happy), blink), 0.05), smile: q(Math.max(0.8, happy), 0.05),
      look: q(s.look * 9, 0.5), shock: q(a("shock"), 0.05), happy: q(happy, 0.05), wink: q(a("wink"), 0.05), open: q(open, 0.08),
    };
    const key = Object.values(pose).join(",");
    if (key !== lastKey) { lastKey = key; btn.innerHTML = devSVG(pose, "Dev, the Appify mascot"); }
  };
  const start = () => { if (!raf && !reduced && s.visible && !document.hidden) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; start(); }).observe(stage);
  document.addEventListener("visibilitychange", start);
  if (reduced) { full.textContent = typedEl.textContent = lines[0] || ""; }
  start();
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
  const days = $("[data-days-row]", form), dayInput = $('input[name="day"]', form);
  const closed = JSON.parse(form.dataset.closed || "[0]"), n = Number(form.dataset.days || 14);
  const fmt = new Intl.DateTimeFormat("en", { weekday: "short" }), fmtM = new Intl.DateTimeFormat("en", { month: "short" });
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  for (let i = 1, added = 0; added < n && i < 40; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    if (closed.includes(d.getDay())) continue;
    const b = document.createElement("button"); b.type = "button"; b.className = "day"; b.dataset.day = iso(d);
    b.innerHTML = `<small>${fmt.format(d)}</small><b>${d.getDate()}</b><small>${fmtM.format(d)}</small>`;
    b.addEventListener("click", () => { $$(".day", days).forEach((x) => x.classList.toggle("on", x === b)); dayInput.value = b.dataset.day; });
    days.append(b); added++;
  }
  const msg = $(".form-msg", form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form), channel = e.submitter?.value || "email";
    const body = { ...Object.fromEntries(fd), services: fd.getAll("services"), channel };
    msg.className = "form-msg";
    if (!body.name?.trim()) { msg.textContent = "Please add your name."; msg.classList.add("err"); form.elements.name.focus(); return; }
    if (!body.phone?.trim() && !body.email?.trim()) { msg.textContent = "Add a phone number or an email so we can reply."; msg.classList.add("err"); form.elements.phone.focus(); return; }
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
// (every top-level section is watched, so the highlight clears over the hero and sections without a link)
const links = $$('.nav-links > a[href^="/#"]');
if (links.length && document.body.classList.contains("home")) {
  const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "/#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main > section").forEach((s) => sio.observe(s));
}
