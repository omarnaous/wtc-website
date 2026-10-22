// "From your Notes to the App Store." A 7-slide carousel (4:5 photos) for Appify's mobile app plan
// (from $999, iOS + Android). Same canvas, thread and type as the store and inventory carousels.
// Plan facts are Appify's own: UI/UX design for every screen, one app for iOS and Android, App Store and Google Play
// publishing, an admin panel, and a free landing page website connected to the app. The proof slide is Darebni AI
// (Appify's iPhone app, live on the App Store) with its real screens; every other app screen is a labelled sample.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "./fx.jsx";
import { Dev } from "./Dev.jsx";
import { C, D, UI, M, Wordmark, Check, Eyebrow, Title, Sample, Canvas, Chrome, Swipe } from "./Carousel.jsx";
import { LOOP } from "./timing.js";

export const APP_N = 7;
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

// ── 1 · the hook: the outcome and the price, up front ─────────────────────────────────────────────────────────────
function Hook() {
  const notes = ["Booking app for my salon", "Clients pay inside", "iPhone AND Android", "Someday…"];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.yellow}>Got an app idea?</Eyebrow>
        <div style={{ ...D, fontSize: 92, color: "#fff", marginTop: 26 }}>From your Notes<br />to the <span style={{ color: C.yellow }}>App Store.</span></div>
      </div>
      <Phone w={270} rot={-7} style={{ left: 90, top: 500 }}>
        <div style={{ padding: "48px 18px", height: "100%", background: "#FFFDF5" }}>
          <div style={{ ...UI, fontSize: 13, color: "#D19A00" }}>‹ Notes</div>
          <div style={{ ...D, fontSize: 26, color: INK, marginTop: 12, letterSpacing: "-0.03em" }}>App idea 💡</div>
          <div style={{ fontFamily: "UIR", fontSize: 11, color: C.mute, marginTop: 4 }}>Edited 3 months ago</div>
          {notes.map((n, i) => (
            <div key={n} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14, fontFamily: "UIR", fontSize: 15, color: i === 3 ? C.mute : INK }}>
              <span style={{ width: 16, height: 16, borderRadius: 99, border: "2px solid #C9C3DD", flex: "none" }} />{n}
            </div>
          ))}
        </div>
      </Phone>
      <svg width="120" height="60" viewBox="0 0 140 60" style={{ position: "absolute", left: 375, top: 760 }}><path d="M6 30 H120 M96 8 L124 30 L96 52" fill="none" stroke={C.yellow} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <Phone w={300} rot={5} glow style={{ left: 640, top: 470 }}>
        <div style={{ padding: "60px 18px", height: "100%", background: "#fff" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 84, height: 84, borderRadius: 20, background: `linear-gradient(135deg, ${C.uv}, #9D7BFF)`, display: "grid", placeItems: "center" }}>
              <svg width="44" height="44" viewBox="0 0 100 100"><path d="M50 8 C54 34 66 46 92 50 C66 54 54 66 50 92 C46 66 34 54 8 50 C34 46 46 34 50 8 Z" fill="#fff" /></svg>
            </div>
            <div><div style={{ ...D, fontSize: 26, color: INK, letterSpacing: "-0.03em" }}>Your App</div><div style={{ fontFamily: "UIR", fontSize: 13, color: C.mute, marginTop: 4 }}>Your brand</div>
              <div style={{ marginTop: 8, display: "inline-block", padding: "6px 20px", borderRadius: 99, background: C.uv, ...UI, fontSize: 15, color: "#fff" }}>Get</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {[0, 1].map((i) => <div key={i} style={{ flex: 1, height: 330, borderRadius: 14, overflow: "hidden", background: "#EEE9FB", position: "relative" }}><div style={{ position: "absolute", left: 8, right: 8, top: 10, bottom: 0, borderRadius: "16px 16px 0 0", overflow: "hidden", background: "#fff" }}><div style={{ width: 300, height: 650, transform: "scale(.4)", transformOrigin: "0 0", position: "relative" }}><SampleScreen w={300} /></div></div></div>)}
          </div>
        </div>
      </Phone>
      <div style={{ position: "absolute", left: 80, top: 1112, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ padding: "14px 26px", borderRadius: 99, background: C.yellow, ...D, fontSize: 40, color: INK, letterSpacing: "-0.03em" }}>From $999</div>
        <span style={{ ...UI, fontSize: 28, color: "#fff" }}>iPhone + Android</span>
      </div>
      <Swipe ph={0} />
    </>
  );
}

// ── 3 · everything that's included, in one price ─────────────────────────────────────────────────────────────────
function Included() {
  const items = [
    ["🎨", "UI/UX design, every screen", "See the whole app before we code"],
    ["📱", "One app, iPhone + Android", "Built once, runs on both"],
    ["🚀", "App Store & Google Play", "We publish it for you"],
    ["🛠️", "Admin panel", "Manage your users and content"],
    ["🌐", "Free landing page website", "Connected to the app"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>What you get</Eyebrow>
        <Title a="Everything to launch." b="One price." bColor={C.yellow} size={88} />
      </div>
      {items.map(([ic, t, d], i) => (
        <div key={t} style={{ position: "absolute", left: 80, top: 470 + i * 122, width: 920, height: 106, borderRadius: 22, background: i % 2 ? "rgba(255,255,255,.06)" : "rgba(91,43,255,.18)", border: "1.5px solid rgba(143,114,255,.35)", display: "flex", alignItems: "center", gap: 22, padding: "0 26px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: C.paper, display: "grid", placeItems: "center", fontSize: 34, flex: "none" }}>{ic}</div>
          <div style={{ flex: 1 }}><div style={{ ...UI, fontSize: 32, color: "#fff" }}>{t}</div><div style={{ fontFamily: "UIR", fontSize: 23, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{d}</div></div>
          <Check size={40} />
        </div>
      ))}
      <div style={{ position: "absolute", right: 80, top: 1096, display: "flex", alignItems: "baseline", gap: 12 }}><span style={{ ...UI, fontSize: 28, color: "rgba(255,255,255,.7)" }}>from</span><span style={{ ...D, fontSize: 84, color: C.yellow, letterSpacing: "-0.05em" }}>$999</span></div>
      <Swipe ph={0} />
    </>
  );
}

// ── 3 · design first ─────────────────────────────────────────────────────────────────────────────────────────────
function Design() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Step 1 · Design</Eyebrow>
        <Title a="See every screen" b="before we write code." size={84} />
      </div>
      <Phone w={300} rot={-4} style={{ left: 110, top: 470, opacity: 0.95 }}><Wireframe /></Phone>
      <svg width="140" height="60" viewBox="0 0 140 60" style={{ position: "absolute", left: 470, top: 760 }}><path d="M6 30 H120 M96 8 L124 30 L96 52" fill="none" stroke={C.yellow} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <Phone w={300} rot={4} glow style={{ left: 650, top: 470 }}><SampleScreen w={300} /></Phone>
      <div style={{ position: "absolute", left: 120, top: 1140, ...M, fontSize: 20, color: "rgba(255,255,255,.6)" }}>Wireframe</div>
      <div style={{ position: "absolute", left: 690, top: 1140, ...M, fontSize: 20, color: C.yellow }}>Final design</div>
      <Sample style={{ left: 80, top: 150 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 5 · one app, both stores, published for you ──────────────────────────────────────────────────────────────────
function Ship() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Step 2 · Build & publish</Eyebrow>
        <Title a="One app. Both stores." b="We publish it." bColor={C.yellow} size={84} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 440, display: "flex", gap: 16 }}>
        {[["Download on the", "App Store"], ["Get it on", "Google Play"]].map(([a, b]) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 14 }}><StoreBtn sub={a} label={b} /><Check size={36} bg={C.mint} fg="#063" /></div>
        ))}
      </div>
      <Phone w={280} rot={-6} glow style={{ left: 160, top: 560 }}><SampleScreen w={280} /></Phone>
      <Phone w={280} rot={6} glow style={{ left: 640, top: 560 }}><SampleScreen w={280} /></Phone>
      <div style={{ position: "absolute", left: 440, top: 800, width: 200, height: 200, borderRadius: 99, background: C.yellow, display: "grid", placeItems: "center", textAlign: "center", transform: "rotate(-8deg)", border: `6px solid ${INK}`, boxShadow: "0 20px 50px rgba(0,0,0,.5)", zIndex: 2 }}>
        <div><div style={{ ...D, fontSize: 54, color: INK }}>1 app</div><div style={{ ...M, fontSize: 15, color: INK, marginTop: 6 }}>2 stores</div></div>
      </div>
      <Sample style={{ left: 80, top: 150 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 6 · you run it: the admin panel and the free landing page ─────────────────────────────────────────────────────
function Run() {
  const rows = [["Sara K.", "New booking"], ["Omar H.", "Signed up"], ["Lea M.", "New booking"]];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Step 3 · Launch</Eyebrow>
        <Title a="Run it yourself." b="Plus a free website." size={84} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 470, width: 600, borderRadius: 24, overflow: "hidden", background: "#13112A", border: "2px solid rgba(143,114,255,.4)", boxShadow: "0 40px 90px rgba(0,0,0,.6)", padding: 24, transform: "rotate(-2deg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...D, fontSize: 32, color: "#fff" }}>Admin panel</span><Wordmark width={90} /></div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>{[["Users", "2,418"], ["Bookings", "164"]].map(([k, v]) => <div key={k} style={{ flex: 1, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,.05)" }}><div style={{ ...M, fontSize: 12, color: "rgba(255,255,255,.5)" }}>{k}</div><div style={{ ...D, fontSize: 40, color: "#fff", marginTop: 6 }}>{v}</div></div>)}</div>
        {rows.map(([n, a]) => <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", ...UI, fontSize: 19, color: "#fff" }}><span style={{ width: 30, height: 30, borderRadius: 99, background: C.iris, display: "grid", placeItems: "center", fontSize: 13 }}>{n[0]}</span>{n} <span style={{ color: "rgba(255,255,255,.55)", fontFamily: "UIR" }}>· {a}</span></div>)}
      </div>
      <div style={{ position: "absolute", left: 380, top: 790, width: 620, borderRadius: 22, overflow: "hidden", background: "#17142B", boxShadow: "0 40px 90px rgba(0,0,0,.6), 0 0 0 2px rgba(143,114,255,.4)", transform: "rotate(2deg)" }}>
        <div style={{ height: 38, display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />)}
          <div style={{ marginLeft: 120, padding: "4px 30px", borderRadius: 8, background: "rgba(255,255,255,.08)", fontFamily: "UIR", fontSize: 15, color: "rgba(255,255,255,.8)" }}>yourapp.com</div>
        </div>
        <div style={{ height: 300, background: "linear-gradient(135deg, #F3F0FF, #FFFFFF 60%)", padding: "34px 34px", position: "relative", overflow: "hidden" }}>
          <div style={{ ...M, fontSize: 13, color: C.uv }}>Free with your app</div>
          <div style={{ ...D, fontSize: 46, color: INK, marginTop: 10, letterSpacing: "-0.04em" }}>Book in<br />two taps.</div>
          <div style={{ display: "flex", gap: 10, marginTop: 22, transform: "scale(.8)", transformOrigin: "0 0" }}><StoreBtn sub="Download on the" label="App Store" /><StoreBtn sub="Get it on" label="Google Play" /></div>
          <Phone w={170} rot={8} style={{ right: 40, top: 26 }}><SampleScreen w={170} /></Phone>
        </div>
      </div>
      <Sample style={{ left: 80, top: 150 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 2 · proof: Darebni AI ─────────────────────────────────────────────────────────────────────────────────────────
function Proof() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Proof, not promises</Eyebrow>
        <Title a="We build apps" b="that go live." size={96} />
      </div>
      <Phone w={240} rot={-9} src="darebni/analytics.jpg" style={{ left: 90, top: 660 }} />
      <Phone w={240} rot={9} src="darebni/builder.jpg" style={{ left: 750, top: 660 }} />
      <Phone w={270} glow src="darebni/home.jpg" style={{ left: 405, top: 600, zIndex: 2 }} />
      <div style={{ position: "absolute", left: 80, top: 462, display: "flex", alignItems: "center", gap: 20, padding: "16px 26px 16px 16px", borderRadius: 26, background: C.paper, boxShadow: "0 30px 70px rgba(0,0,0,.5)" }}>
        <Img src={staticFile("darebni/icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
        <div><div style={{ ...D, fontSize: 40, color: INK, letterSpacing: "-0.03em" }}>Darebni AI</div><div style={{ ...UI, fontSize: 20, color: "#3A3550", marginTop: 6 }}>An AI workout coach for iPhone · <span style={{ color: C.uv }}>Live on the App Store</span></div></div>
      </div>
      <Swipe ph={0} label="Yours is next" />
    </>
  );
}

// ── 7 · the DM, and exactly what happens next ─────────────────────────────────────────────────────────────────────
function Cta() {
  const steps = [["1", "DM us “APP”", "Tell us your idea in one line"], ["2", "We book a call", "We go through your app together"], ["3", "Your exact price", "Confirmed on the call · from $999"]];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Here's how it starts</Eyebrow>
        <div style={{ ...D, fontSize: 96, color: "#fff", marginTop: 26 }}>Your app,<br /><span style={{ color: C.yellow }}>in 3 steps.</span></div>
      </div>
      {steps.map(([n, t, d], i) => (
        <div key={n} style={{ position: "absolute", left: 80, top: 480 + i * 160, width: 580, display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 84, height: 84, borderRadius: 99, background: i === 0 ? C.yellow : C.uv, color: i === 0 ? INK : "#fff", display: "grid", placeItems: "center", ...D, fontSize: 44, flex: "none" }}>{n}</div>
          <div><div style={{ ...D, fontSize: 44, color: "#fff", letterSpacing: "-0.03em" }}>{t}</div><div style={{ fontFamily: "UIR", fontSize: 25, color: "rgba(255,255,255,.65)", marginTop: 6 }}>{d}</div></div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 80, top: 980, padding: "22px 34px", borderRadius: 26, background: C.yellow, boxShadow: "0 20px 60px rgba(255,210,63,.3)" }}>
        <div style={{ ...M, fontSize: 21, color: INK }}>Start now · DM us</div>
        <div style={{ ...D, fontSize: 70, color: INK, marginTop: 6 }}>“APP”</div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1150, ...M, fontSize: 22, color: "rgba(255,255,255,.7)" }}>@appifylb</div>
      <div style={{ position: "absolute", left: 690, top: 520 }}>
        <Dev width={320} thumbs={1} smile={1} happy={1} brow={16} lid={0.05} look={-8} tilt={-3} />
      </div>
    </>
  );
}

const SLIDES = [Hook, Proof, Included, Design, Ship, Run, Cta];
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
