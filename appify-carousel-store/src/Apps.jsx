// "Your app idea is still in your Notes app." A 9-slide carousel (4:5 photos) for Appify's mobile app plan
// (from $999, iOS + Android). Same canvas, thread and type as the store and inventory carousels.
// Plan facts are Appify's own: UI/UX design for every screen, one app for iOS and Android, App Store and Google Play
// publishing, an admin panel, and a free landing page website connected to the app. The proof slide is Darebni AI
// (Appify's iPhone app, live on the App Store) with its real screens; every other app screen is a labelled sample.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "./fx.jsx";
import { Dev } from "./Dev.jsx";
import { C, D, UI, M, Wordmark, Check, Eyebrow, Title, Sample, Canvas, Chrome, Swipe } from "./Carousel.jsx";
import { LOOP } from "./timing.js";

export const APP_N = 9;
const INK = "#0A0913";

// a phone: ink bezel, rounded screen, the island; children (or an image) fill the screen
function Phone({ w = 300, src, rot = 0, style, children, glow }) {
  const h = w * 2.17, r = w * 0.15, b = w * 0.035;
  return (
    <div style={{ position: "absolute", width: w, height: h, borderRadius: r, background: "#1A1730", padding: b, boxShadow: `0 40px 90px rgba(0,0,0,.6)${glow ? ", 0 0 80px rgba(91,43,255,.45)" : ""}`, border: "2px solid rgba(255,255,255,.12)", transform: `rotate(${rot}deg)`, ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - b, overflow: "hidden", background: "#F6F4FC" }}>
        {src ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : children}
        <div style={{ position: "absolute", left: "50%", top: w * 0.03, width: w * 0.3, height: w * 0.085, borderRadius: 99, background: INK, transform: "translateX(-50%)" }} />
      </div>
    </div>
  );
}
// a sample app screen ("Your App"), used wherever the screen isn't a real Appify app
function SampleScreen({ w = 300 }) {
  const k = w / 300;
  return (
    <div style={{ padding: `${46 * k}px ${16 * k}px`, height: "100%", background: "linear-gradient(180deg, #F3F0FF, #FFFFFF)" }}>
      <div style={{ ...D, fontSize: 24 * k, color: INK, letterSpacing: "-0.03em" }}>Your App</div>
      <div style={{ fontFamily: "UIR", fontSize: 11 * k, color: C.mute, marginTop: 4 * k }}>Good morning 👋</div>
      <div style={{ marginTop: 14 * k, borderRadius: 16 * k, padding: 14 * k, background: `linear-gradient(120deg, ${C.uv}, #9D7BFF)`, color: "#fff" }}>
        <div style={{ ...M, fontSize: 8 * k, opacity: 0.8 }}>Featured</div>
        <div style={{ ...D, fontSize: 18 * k, marginTop: 6 * k, letterSpacing: "-0.02em" }}>Book in<br />two taps</div>
        <div style={{ marginTop: 10 * k, display: "inline-block", padding: `${5 * k}px ${12 * k}px`, borderRadius: 99, background: "#fff", color: INK, ...UI, fontSize: 10 * k }}>Book now</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 * k, marginTop: 10 * k }}>
        {["#FFE9DC", "#DDF1FF", "#DFF7EA", "#FFF3C9"].map((bg, i) => (
          <div key={i} style={{ height: 70 * k, borderRadius: 12 * k, background: bg, padding: 8 * k }}>
            <div style={{ width: 18 * k, height: 18 * k, borderRadius: 6 * k, background: [C.pink, "#74C6FF", C.mint, C.yellow][i] }} />
            <div style={{ ...UI, fontSize: 10 * k, color: INK, marginTop: 22 * k }}>{["Services", "Offers", "Rewards", "Profile"][i]}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 12 * k, right: 12 * k, bottom: 14 * k, height: 40 * k, borderRadius: 99, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.1)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[0, 1, 2, 3].map((i) => <i key={i} style={{ width: 14 * k, height: 14 * k, borderRadius: 5 * k, background: i ? "#CFCAE0" : C.uv }} />)}
      </div>
    </div>
  );
}
// the same screen as a grey wireframe (the design step before)
function Wireframe() {
  const bar = (w, h = 10, mt = 10) => <div style={{ width: w, height: h, borderRadius: 6, background: "#D9D5E8", marginTop: mt }} />;
  return (
    <div style={{ padding: "48px 18px", height: "100%", background: "#FBFAFE", backgroundImage: "linear-gradient(rgba(91,43,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(91,43,255,.06) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
      {bar(120, 18, 0)}{bar(80, 8, 8)}
      <div style={{ height: 120, borderRadius: 16, border: "2px dashed #B9B2D6", marginTop: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 80, borderRadius: 12, border: "2px dashed #B9B2D6" }} />)}
      </div>
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 16, height: 42, borderRadius: 99, border: "2px dashed #B9B2D6" }} />
    </div>
  );
}
const StoreBtn = ({ label, sub }) => (
  <div style={{ display: "flex", flexDirection: "column", padding: "10px 22px", borderRadius: 14, background: INK, color: "#fff", minWidth: 170 }}>
    <span style={{ ...M, fontSize: 12, opacity: 0.7, letterSpacing: "0.1em" }}>{sub}</span>
    <span style={{ ...UI, fontSize: 26 }}>{label}</span>
  </div>
);

// ── 1 · the hook ─────────────────────────────────────────────────────────────────────────────────────────────────
function Hook() {
  const notes = ["Booking app for my salon", "Clients pay inside the app", "Needs iPhone AND Android", "Ask someone… someday"];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>Sound familiar?</Eyebrow>
        <div style={{ ...D, fontSize: 98, color: "#fff", marginTop: 26 }}>Your app idea is<br />still in your <span style={{ color: C.yellow }}>Notes.</span></div>
      </div>
      <Phone w={330} rot={-5} style={{ left: 110, top: 480 }}>
        <div style={{ padding: "54px 22px", height: "100%", background: "#FFFDF5" }}>
          <div style={{ ...UI, fontSize: 15, color: "#D19A00" }}>‹ Notes</div>
          <div style={{ ...D, fontSize: 30, color: INK, marginTop: 14, letterSpacing: "-0.03em" }}>App idea 💡</div>
          <div style={{ fontFamily: "UIR", fontSize: 13, color: C.mute, marginTop: 6 }}>Edited 3 months ago</div>
          {notes.map((n, i) => (
            <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18, fontFamily: "UIR", fontSize: 18, color: i === 3 ? C.mute : INK, lineHeight: 1.3 }}>
              <span style={{ width: 20, height: 20, borderRadius: 99, border: "2px solid #C9C3DD", flex: "none", marginTop: 2 }} />{n}
            </div>
          ))}
        </div>
      </Phone>
      <div style={{ position: "absolute", left: 660, top: 500 }}>
        <Dev width={340} point={1} smile={0.4} brow={20} lid={0.05} look={-10} tilt={-4} />
      </div>
      <Swipe ph={0} />
    </>
  );
}

// ── 2 · what's stopping you ──────────────────────────────────────────────────────────────────────────────────────
function Stopping() {
  const qs = [["Where do I even start?", -3, 0], ["iPhone or Android?", 2, 210], ["How do I get it on the App Store?", -2, 420]];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>The questions</Eyebrow>
        <Title a="So what's" b="stopping you?" bColor={C.pink} size={96} />
      </div>
      {qs.map(([q, rot, dy], i) => (
        <div key={q} style={{ position: "absolute", left: i === 1 ? 230 : 80, top: 500 + dy, padding: "30px 38px", borderRadius: 30, borderBottomLeftRadius: 8, background: C.paper, ...D, fontSize: 50, color: INK, letterSpacing: "-0.03em", transform: `rotate(${rot}deg)`, boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
          <span style={{ color: C.pink }}>?</span> {q}
        </div>
      ))}
      <div style={{ position: "absolute", left: 80, top: 1110, ...UI, fontSize: 32, color: "rgba(255,255,255,.85)" }}>Good news: <span style={{ color: C.yellow }}>we handle all of it.</span></div>
      <Swipe ph={0} />
    </>
  );
}

// ── 3 · design first ─────────────────────────────────────────────────────────────────────────────────────────────
function Design() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>01 · UI/UX design</Eyebrow>
        <Title a="Every screen designed" b="before we build." size={80} />
      </div>
      <Phone w={300} rot={-4} style={{ left: 110, top: 470, opacity: 0.95 }}><Wireframe /></Phone>
      <svg width="140" height="60" viewBox="0 0 140 60" style={{ position: "absolute", left: 470, top: 760 }}><path d="M6 30 H120 M96 8 L124 30 L96 52" fill="none" stroke={C.yellow} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <Phone w={300} rot={4} glow style={{ left: 650, top: 470 }}><SampleScreen w={300} /></Phone>
      <div style={{ position: "absolute", left: 120, top: 1140, ...M, fontSize: 20, color: "rgba(255,255,255,.6)" }}>Wireframe</div>
      <div style={{ position: "absolute", left: 690, top: 1140, ...M, fontSize: 20, color: C.yellow }}>Final design</div>
      <Sample style={{ left: 420, top: 1176 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 4 · one app, both platforms ──────────────────────────────────────────────────────────────────────────────────
function Both() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>02 · iOS + Android</Eyebrow>
        <Title a="iPhone and Android." b="One app." bColor={C.yellow} size={88} />
      </div>
      <Phone w={310} rot={-6} glow style={{ left: 150, top: 480 }}><SampleScreen w={310} /></Phone>
      <Phone w={310} rot={6} glow style={{ left: 600, top: 480 }}><SampleScreen w={310} /></Phone>
      <div style={{ position: "absolute", left: 440, top: 740, width: 200, height: 200, borderRadius: 99, background: C.yellow, display: "grid", placeItems: "center", textAlign: "center", transform: "rotate(-8deg)", border: `6px solid ${INK}`, boxShadow: "0 20px 50px rgba(0,0,0,.5)", zIndex: 2 }}>
        <div><div style={{ ...D, fontSize: 54, color: INK }}>1 app</div><div style={{ ...M, fontSize: 15, color: INK, marginTop: 6 }}>2 stores</div></div>
      </div>
      <div style={{ position: "absolute", left: 170, top: 440, ...M, fontSize: 22, color: "rgba(255,255,255,.75)" }}>iOS</div>
      <div style={{ position: "absolute", left: 790, top: 440, ...M, fontSize: 22, color: "rgba(255,255,255,.75)" }}>Android</div>
      <Swipe ph={0} />
    </>
  );
}

// ── 5 · publishing ───────────────────────────────────────────────────────────────────────────────────────────────
function Publish() {
  const steps = ["Store listing", "Screenshots", "Submission to both stores"];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>03 · Store publishing</Eyebrow>
        <Title a="App Store & Google Play?" b="We publish it for you." size={74} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 480, width: 920, borderRadius: 28, background: C.paper, padding: 34, boxShadow: "0 50px 110px rgba(0,0,0,.6), 0 0 70px rgba(91,43,255,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 150, height: 150, borderRadius: 36, background: `linear-gradient(135deg, ${C.uv}, #9D7BFF)`, display: "grid", placeItems: "center", boxShadow: "0 14px 30px rgba(91,43,255,.4)" }}>
            <svg width="80" height="80" viewBox="0 0 100 100"><path d="M50 8 C54 34 66 46 92 50 C66 54 54 66 50 92 C46 66 34 54 8 50 C34 46 46 34 50 8 Z" fill="#fff" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...D, fontSize: 52, color: INK, letterSpacing: "-0.03em" }}>Your App</div>
            <div style={{ fontFamily: "UIR", fontSize: 24, color: C.mute, marginTop: 6 }}>Your brand · Lifestyle</div>
          </div>
          <div style={{ padding: "14px 34px", borderRadius: 99, background: C.uv, ...UI, fontSize: 28, color: "#fff" }}>Get</div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 260, borderRadius: 20, overflow: "hidden", background: "#E9E4FA", position: "relative" }}><div style={{ position: "absolute", inset: "14px 18px 0", borderRadius: "22px 22px 0 0", background: "#fff", overflow: "hidden" }}><div style={{ transform: "scale(.82)", transformOrigin: "50% 0" }}><div style={{ width: 300, height: 650, position: "relative" }}><SampleScreen w={300} /></div></div></div></div>)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1000, display: "flex", gap: 14, flexWrap: "wrap", width: 920 }}>
        {steps.map((s) => <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 22px 14px 14px", borderRadius: 99, background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(143,114,255,.45)", ...UI, fontSize: 26, color: "#fff" }}><Check size={32} />{s}</div>)}
      </div>
      <Sample style={{ left: 80, top: 1176 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 6 · the admin panel ──────────────────────────────────────────────────────────────────────────────────────────
function Admin() {
  const rows = [["Sara K.", "New booking", "2 min ago"], ["Omar H.", "Signed up", "14 min ago"], ["Lea M.", "New booking", "1 h ago"], ["Rami T.", "Left a review", "3 h ago"]];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>04 · Admin panel</Eyebrow>
        <Title a="Run your app" b="from one dashboard." size={84} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 480, width: 760, height: 620, borderRadius: 24, overflow: "hidden", background: "#13112A", border: "2px solid rgba(143,114,255,.35)", boxShadow: "0 50px 110px rgba(0,0,0,.6)", display: "flex" }}>
        <div style={{ width: 180, background: "#0E0C20", padding: "26px 18px" }}>
          <Wordmark width={100} />
          {["Overview", "Users", "Bookings", "Content", "Notifications"].map((s, i) => <div key={s} style={{ marginTop: i ? 8 : 24, padding: "11px 12px", borderRadius: 12, background: i === 1 ? "rgba(91,43,255,.35)" : "transparent", ...UI, fontSize: 18, color: i === 1 ? "#fff" : "rgba(255,255,255,.55)" }}>{s}</div>)}
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          <div style={{ display: "flex", gap: 14 }}>
            {[["Users", "2,418"], ["Bookings", "164"]].map(([k, v]) => <div key={k} style={{ flex: 1, padding: "16px 18px", borderRadius: 16, background: "rgba(255,255,255,.05)" }}><div style={{ ...M, fontSize: 13, color: "rgba(255,255,255,.5)" }}>{k}</div><div style={{ ...D, fontSize: 46, color: "#fff", marginTop: 8 }}>{v}</div></div>)}
          </div>
          <div style={{ ...M, fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 24 }}>Activity</div>
          {rows.map(([n, a, t]) => <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,.04)", ...UI, fontSize: 20, color: "#fff" }}><span style={{ width: 34, height: 34, borderRadius: 99, background: C.iris, display: "grid", placeItems: "center", fontSize: 14 }}>{n[0]}</span><span style={{ flex: 1 }}>{n} <span style={{ color: "rgba(255,255,255,.55)", fontFamily: "UIR" }}>· {a}</span></span><span style={{ ...M, fontSize: 12, color: "rgba(255,255,255,.45)" }}>{t}</span></div>)}
        </div>
      </div>
      <Phone w={230} rot={6} glow style={{ left: 790, top: 640 }}><SampleScreen w={230} /></Phone>
      <Sample style={{ left: 80, top: 1118 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 7 · the free landing page ─────────────────────────────────────────────────────────────────────────────────────
function Landing() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>05 · Free landing page</Eyebrow>
        <Title a="Plus a free website" b="for your app." bColor={C.yellow} size={88} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 480, width: 920, borderRadius: 24, overflow: "hidden", background: "#17142B", boxShadow: "0 50px 110px rgba(0,0,0,.6), 0 0 0 2px rgba(143,114,255,.4)" }}>
        <div style={{ height: 46, display: "flex", alignItems: "center", gap: 9, padding: "0 18px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
          <div style={{ marginLeft: 220, padding: "5px 40px", borderRadius: 9, background: "rgba(255,255,255,.08)", fontFamily: "UIR", fontSize: 18, color: "rgba(255,255,255,.8)" }}>yourapp.com</div>
        </div>
        <div style={{ position: "relative", height: 560, background: "linear-gradient(135deg, #F3F0FF, #FFFFFF 60%)", padding: "60px 54px", overflow: "hidden" }}>
          <div style={{ ...M, fontSize: 16, color: C.uv }}>Now on iOS & Android</div>
          <div style={{ ...D, fontSize: 64, color: INK, marginTop: 16, letterSpacing: "-0.04em" }}>Book in<br />two taps.</div>
          <div style={{ fontFamily: "UIR", fontSize: 22, color: "#5B5575", marginTop: 18, width: 420, lineHeight: 1.4 }}>Your app's home on the web: what it does, and where to download it.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 30 }}><StoreBtn sub="Download on the" label="App Store" /><StoreBtn sub="Get it on" label="Google Play" /></div>
          <Phone w={250} rot={8} style={{ right: 60, top: 40 }}><SampleScreen w={250} /></Phone>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1112, ...UI, fontSize: 28, color: "rgba(255,255,255,.8)" }}>Connected to the app. <span style={{ color: C.yellow }}>Included free.</span></div>
      <Swipe ph={0} />
    </>
  );
}

// ── 8 · proof: Darebni AI ─────────────────────────────────────────────────────────────────────────────────────────
function Proof() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Built by Appify</Eyebrow>
        <Title a="We've shipped" b="our own." size={96} />
      </div>
      <Phone w={240} rot={-9} src="darebni/analytics.jpg" style={{ left: 90, top: 660 }} />
      <Phone w={240} rot={9} src="darebni/builder.jpg" style={{ left: 750, top: 660 }} />
      <Phone w={270} glow src="darebni/home.jpg" style={{ left: 405, top: 600, zIndex: 2 }} />
      <div style={{ position: "absolute", left: 80, top: 462, display: "flex", alignItems: "center", gap: 20, padding: "16px 26px 16px 16px", borderRadius: 26, background: C.paper, boxShadow: "0 30px 70px rgba(0,0,0,.5)" }}>
        <Img src={staticFile("darebni/icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
        <div><div style={{ ...D, fontSize: 40, color: INK, letterSpacing: "-0.03em" }}>Darebni AI</div><div style={{ ...UI, fontSize: 20, color: "#3A3550", marginTop: 6 }}>An AI workout coach for iPhone · <span style={{ color: C.uv }}>Live on the App Store</span></div></div>
      </div>
    </>
  );
}

// ── 9 · price + the DM ────────────────────────────────────────────────────────────────────────────────────────────
function Cta() {
  const lines = ["UI/UX design, every screen", "One app, iOS + Android", "App Store & Google Play publishing", "Admin panel for your team", "Free landing page website"];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Let's build it</Eyebrow>
        <div style={{ ...D, fontSize: 96, color: "#fff", marginTop: 26 }}>Got an<br /><span style={{ color: C.yellow }}>app idea?</span></div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 500, width: 560 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}><span style={{ ...UI, fontSize: 32, color: "rgba(255,255,255,.7)" }}>from</span><span style={{ ...D, fontSize: 150, color: "#fff", letterSpacing: "-0.06em" }}>$999</span></div>
        {lines.map((l) => <div key={l} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, ...UI, fontSize: 27, color: "#fff" }}><Check size={32} />{l}</div>)}
      </div>
      <div style={{ position: "absolute", left: 80, top: 980 }}>
        <div style={{ padding: "22px 34px", borderRadius: 26, background: C.yellow, boxShadow: "0 20px 60px rgba(255,210,63,.3)" }}>
          <div style={{ ...M, fontSize: 21, color: INK }}>DM us to book a call</div>
          <div style={{ ...D, fontSize: 70, color: INK, marginTop: 6 }}>“APP”</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1150, ...M, fontSize: 22, color: "rgba(255,255,255,.7)" }}>@appifylb</div>
      <div style={{ position: "absolute", left: 680, top: 470 }}>
        <Dev width={330} thumbs={1} smile={1} happy={1} brow={16} lid={0.05} look={-8} tilt={-3} />
      </div>
    </>
  );
}

const SLIDES = [Hook, Stopping, Design, Both, Publish, Admin, Landing, Proof, Cta];
export const AppSlide = ({ slide = 0 }) => {
  const f = useCurrentFrame(), ph = (f % LOOP) / LOOP;
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const S = SLIDES[slide];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Canvas slide={slide} ph={ph} n={APP_N} />
      <S ph={ph} />
      <Chrome slide={slide} n={APP_N} />
    </AbsoluteFill>
  );
};
