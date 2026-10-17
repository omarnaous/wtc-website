// Appify's intro for the website hero (16:9, tap to play with sound). It tells a visitor who we are, why we do it and
// what we do: Dev says hi, the mission ("we turn ideas into websites, apps & content that put your brand in the
// spotlight"), then the five services one by one, each proved by a real example on the right, then the slogan: Dev
// lights a spark ("Got an idea?") and it becomes "Appify it." The camera pushes into that spark and the end card opens
// through it: the wordmark (its i-dot is the spark), the slogan, the services and the call to action.
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { DEV_IN, HELLO, MISSION, M_WORDS, M_SPOT, WHAT, SVC_LEN, SVCS, IDEA, SPARK, APPIFY, FLY, END, CUTS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, Burst, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const W = 1920, H = 1080;
const C = { ink: "#0A0913", ink2: "#17142B", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", mute: "#8A84A3", soft: "#C9C4DD", green: "#39E29B" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.98 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 230) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.5) => ({ opacity: Math.min(1, p * 2.5), transform: `scale(${interpolate(Math.min(p, 1.15), [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.iris, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const grad = { background: `linear-gradient(100deg, ${C.iris}, ${C.sky} 60%, #C9B8FF)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
const SPARK_AT = [1560, 205];   // where Dev's idea lights up in the slogan scene

function Stage({ f, beam = 1, beamX = 1290 }) {
  return (
    <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "80px 80px", backgroundPosition: `0 ${f * 0.6}px`, WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, #000 30%, transparent 78%)", maskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, #000 30%, transparent 78%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 55% at ${(beamX / W) * 100}% 55%, rgba(91,43,255,.45), transparent 70%), radial-gradient(ellipse 40% 30% at 85% 10%, rgba(116,198,255,.12), transparent 70%)` }} />
      <div style={{ position: "absolute", left: beamX - 330, top: -120, width: 660, height: 1300, opacity: beam, background: "linear-gradient(180deg, rgba(220,210,255,.22), rgba(143,114,255,.05) 60%, transparent 85%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(16px)", transform: `rotate(${6 + Math.sin(f / 40)}deg)`, transformOrigin: "50% 0" }} />
    </>
  );
}
const Kicker = ({ n, children, p }) => <div style={{ ...M, fontSize: 24, color: C.iris, display: "flex", gap: 16, alignItems: "center", ...rise(p, 20) }}>{n && <span style={{ color: C.sky, padding: "8px 12px", border: "2px solid rgba(116,198,255,.4)", borderRadius: 10 }}>{n}</span>}{children}</div>;
const Price = ({ children, p }) => <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 34, padding: "14px 26px", borderRadius: 99, background: "rgba(91,43,255,.18)", border: `2px solid ${C.uv}`, ...UI, fontSize: 32, color: "#fff", ...pop(p, 1.3), transformOrigin: "0 50%" }}><Spark size={24} />{children}</div>;
const Pill = ({ children, p, color = C.green }) => <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 99, background: "rgba(17,15,30,.9)", border: `2px solid ${color}88`, ...UI, fontSize: 28, color: "#fff", ...pop(p, 1.4), transformOrigin: "0 50%" }}><span style={{ width: 14, height: 14, borderRadius: 7, background: color }} />{children}</div>;
const Caption = ({ children, p, style }) => <div style={{ ...M, fontSize: 18, color: C.mute, opacity: Math.min(1, p), ...style }}>{children}</div>;
const Clip = ({ src, from, at, style, fit = "cover" }) => (
  <div style={{ overflow: "hidden", background: "#000", ...style }}>
    <Sequence from={at} layout="none"><OffthreadVideo src={staticFile(src)} startFrom={from} muted style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }} /></Sequence>
  </div>
);
const Browser = ({ url, width, children, style }) => (
  <div style={{ width, borderRadius: 26, overflow: "hidden", background: "#17152A", border: "2px solid rgba(143,114,255,.4)", boxShadow: "0 50px 120px -30px rgba(91,43,255,.6)", ...style }}>
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#1D1A33" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
      <span style={{ marginLeft: 16, flex: 1, height: 30, borderRadius: 10, background: "rgba(10,9,19,.7)", display: "flex", alignItems: "center", padding: "0 14px", fontFamily: "Mono", fontSize: 18, color: C.mute }}>{url}</span>
    </div>
    {children}
  </div>
);

// ── 1 · hello ───────────────────────────────────────────────────────────────────────────────────────────
function Hello({ f }) {
  const dev = sp(f, DEV_IN, 14, 140);
  return (
    <AbsoluteFill>
      <Stage f={f} beam={interpolate(f, [0, 20], [0, 1], clamp)} />
      <div style={{ position: "absolute", left: 160, top: 330 }}>
        <div style={{ ...D, fontSize: 120, color: "#fff", ...pop(sp(f, HELLO, 10, 300)) }}>Hi, we're</div>
        <div style={{ ...D, fontSize: 200, marginTop: 10, ...pop(sp(f, HELLO + 8, 10, 300)) }}><span style={grad}>Appify.</span></div>
        <div style={{ ...M, fontSize: 26, color: C.soft, marginTop: 40, ...rise(sp(f, HELLO + 24), 20) }}>A creative tech studio in Lebanon</div>
      </div>
      <div style={{ position: "absolute", left: 1290 - 210, top: 255, transform: `translateY(${(1 - Math.min(1, dev)) * 900}px)` }}>
        <Dev width={420} wave={1} waveAng={Math.sin(f / 3) * 18} brow={12} lid={0.06} smile={1} happy={0.4} look={-4} tilt={Math.sin(f / 12) * 2} />
      </div>
    </AbsoluteFill>
  );
}

// ── 2 · the mission: ideas into websites, apps & content, brands in the spotlight ─────────────────────────
function Mission({ f }) {
  const flare = interpolate(f, [M_SPOT, M_SPOT + 6, M_SPOT + 40], [0, 1, 0.55], clamp);
  const words = ["websites,", "apps", "& content"];
  const up = interpolate(f, [M_SPOT - 4, M_SPOT + 8], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <Stage f={f} beam={0.55 + 0.45 * flare} beamX={W / 2} />
      {/* the spotlight flares onto the line when it says "spotlight" */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 40% at 50% 62%, rgba(200,185,255,${0.22 * flare}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 - 60 * up, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Kicker p={sp(f, MISSION + 4)}>Our mission</Kicker></div>
        <div style={{ ...D, fontSize: 92, color: "#fff", marginTop: 40, ...rise(sp(f, MISSION + 8, 12, 200), 40) }}>We turn ideas into</div>
        <div style={{ ...D, fontSize: 124, marginTop: 18, display: "flex", justifyContent: "center", gap: 34 }}>
          {words.map((w, k) => <span key={w} style={{ ...grad, display: "inline-block", ...pop(sp(f, M_WORDS[k], 9, 300), 1.6) }}>{w}</span>)}
        </div>
        <div style={{ ...D, fontSize: 92, color: "#fff", marginTop: 40, ...rise(sp(f, M_SPOT, 12, 220), 50) }}>that put your brand <span style={{ color: "#fff", textShadow: `0 0 ${40 * flare}px rgba(220,210,255,.9)` }}>in the spotlight.</span></div>
      </div>
    </AbsoluteFill>
  );
}

// ── 3 · what we do: five services, each with an example ───────────────────────────────────────────────────
const SERVICES = [
  { name: "Websites & online stores", line: "Fast sites with an admin panel and hosting. Pay once, no monthly fees.", price: "from $360", show: "web", caption: "Example · Watch Trade Chronicles, live client store" },
  { name: "Web apps & systems", line: "CRMs, dashboards and automations that run your business.", price: "from $500", show: "dash", caption: "Sample dashboard" },
  { name: "Mobile apps", line: "One app for iOS and Android, with the admin side and the store listings handled.", price: "from $999", show: "phone", caption: "Example · demo store app by Appify" },
  { name: "Motion graphics", line: "Reels, 3D and video ads, with sound designed to the picture.", price: "3 videos · $199", show: "reels", caption: "Examples · Appify motion work" },
  { name: "Meta ads", line: "Instagram and Facebook campaigns, not just boosted posts.", show: "ad", caption: "Example · an Appify ad" },
];
const RAIL = ["Websites", "Web apps", "Mobile apps", "Motion graphics", "Meta ads"];

function Dashboard({ t }) {
  // a sample admin dashboard drawn in code; the numbers are illustrative and labelled as a sample on screen
  const grow = (k) => interpolate(t, [8 + k * 2, 30 + k * 2], [0, 1], { ...clamp, easing: easeOut });
  const count = (v) => Math.round(v * interpolate(t, [6, 40], [0, 1], { ...clamp, easing: easeOut }));
  const bars = [0.42, 0.55, 0.48, 0.66, 0.6, 0.74, 0.7, 0.82, 0.78, 0.9, 0.86, 0.97];
  return (
    <div style={{ display: "flex", height: 520, background: "#0E0C1B" }}>
      <div style={{ width: 190, background: "#141127", padding: "26px 20px", display: "grid", gap: 16, alignContent: "start" }}>
        <div style={{ ...UI, fontSize: 22, color: "#fff", marginBottom: 10 }}>Admin</div>
        {["Overview", "Orders", "Customers", "Automations", "Settings"].map((x, k) => <div key={x} style={{ ...UI, fontSize: 17, color: k === 0 ? "#fff" : C.mute, padding: "9px 12px", borderRadius: 10, background: k === 0 ? "rgba(91,43,255,.35)" : "transparent" }}>{x}</div>)}
      </div>
      <div style={{ flex: 1, padding: 26, display: "grid", gap: 20, alignContent: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[["Orders", count(1284), ""], ["Revenue", count(48210), "$"], ["Leads", count(362), ""]].map(([k, v, pre]) => (
            <div key={k} style={{ padding: "16px 18px", borderRadius: 16, background: "#17142B", border: "1.5px solid rgba(143,114,255,.25)" }}>
              <div style={{ ...M, fontSize: 13, color: C.mute }}>{k}</div>
              <div style={{ ...D, fontSize: 40, color: "#fff", marginTop: 10, letterSpacing: "-0.03em" }}>{pre}{v.toLocaleString("en-US")}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 200, padding: "18px 18px 0", borderRadius: 16, background: "#17142B", border: "1.5px solid rgba(143,114,255,.25)", display: "flex", alignItems: "flex-end", gap: 12 }}>
          {bars.map((b, k) => <div key={k} style={{ flex: 1, height: `${b * 92 * grow(k)}%`, borderRadius: "8px 8px 0 0", background: `linear-gradient(180deg, ${C.sky}, ${C.uv})` }} />)}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[["New order · #1042", "Paid"], ["Lead added to CRM", "Auto"]].map(([a, b], k) => (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, background: "#17142B", opacity: interpolate(t, [24 + k * 8, 32 + k * 8], [0, 1], clamp) }}>
              <span style={{ ...UI, fontSize: 17, color: C.soft }}>{a}</span><span style={{ ...M, fontSize: 13, color: C.green }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Showcase({ s, f, at }) {
  const t = f - at, p = sp(f, at + 4, 13, 180);
  const inY = (d = 140) => ({ transform: `translateY(${(1 - Math.min(1, p)) * d}px)`, opacity: Math.min(1, p * 2) });
  if (s.show === "web" || s.show === "dash") return (
    <div style={{ position: "absolute", left: 870, top: 190, ...inY() }}>
      <Browser url={s.show === "web" ? "watchtradechronicles.com" : "admin.yourbusiness.com"} width={950}>
        {s.show === "web" ? <Clip src="wtc-launch.mp4" from={15} at={at} style={{ width: 950, height: 534 }} /> : <Dashboard t={t} />}
      </Browser>
      <Caption p={p} style={{ marginTop: 20 }}>{s.caption}</Caption>
    </div>
  );
  if (s.show === "phone") return (
    <>
      <div style={{ position: "absolute", left: 1070, top: 120, ...inY() }}>
        <Clip src="ecommerce-chat.mp4" from={195} at={at} style={{ width: 430, height: 764, borderRadius: 40, border: "3px solid rgba(143,114,255,.45)", boxShadow: "0 50px 120px -30px rgba(91,43,255,.7)" }} />
        <Caption p={p} style={{ marginTop: 16, textAlign: "center" }}>{s.caption}</Caption>
      </div>
      <div style={{ position: "absolute", left: 1550, top: 360, display: "grid", gap: 22 }}>
        <Pill p={sp(f, at + 20, 9, 300)}>App Store</Pill>
        <Pill p={sp(f, at + 28, 9, 300)}>Google Play</Pill>
        <Pill p={sp(f, at + 36, 9, 300)} color={C.iris}>Admin panel</Pill>
      </div>
    </>
  );
  if (s.show === "reels") return (
    <>
      {[["balloon.mp4", 15, -5], ["showreel.mp4", 60, 0], ["lifetime.mp4", 10, 5]].map(([src, from, rot], k) => {
        const q = sp(f, at + 2 + k * 7, 12, 190);
        return (
          <div key={src} style={{ position: "absolute", left: 930 + k * 300, top: 170 + (k === 1 ? -30 : 20), transform: `translateY(${(1 - Math.min(1, q)) * 700}px) rotate(${rot}deg)`, opacity: Math.min(1, q * 2) }}>
            <Clip src={src} from={from} at={at + k * 7} style={{ width: 280, height: 498, borderRadius: 30, border: "3px solid rgba(143,114,255,.4)", boxShadow: "0 40px 90px rgba(0,0,0,.55)" }} />
          </div>
        );
      })}
      <Caption p={p} style={{ position: "absolute", left: 940, top: 760 }}>{s.caption}</Caption>
    </>
  );
  // Meta ads: the ad as it appears in the feed
  return (
    <div style={{ position: "absolute", left: 1130, top: 96, ...inY() }}>
      <div style={{ width: 440, borderRadius: 30, overflow: "hidden", background: "#121022", border: "2px solid rgba(143,114,255,.4)", boxShadow: "0 50px 120px -30px rgba(91,43,255,.7)" }}>
        <div style={{ height: 70, display: "flex", alignItems: "center", gap: 14, padding: "0 20px" }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${C.uv}, ${C.sky})`, display: "grid", placeItems: "center" }}><Spark size={20} color="#fff" /></div>
          <div><div style={{ ...UI, fontSize: 19, color: "#fff" }}>appifylb</div><div style={{ ...UI, fontSize: 14, color: C.mute }}>Sponsored</div></div>
        </div>
        <Clip src="meta-ads.mp4" from={20} at={at} style={{ width: 440, height: 600 }} />
        <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "#1A1730" }}>
          <span style={{ ...UI, fontSize: 18, color: C.soft }}>appify-lb.com</span>
          <span style={{ ...UI, fontSize: 17, color: "#fff", padding: "9px 16px", borderRadius: 10, background: C.uv }}>Learn more</span>
        </div>
      </div>
      <Caption p={p} style={{ marginTop: 16, textAlign: "center" }}>{s.caption}</Caption>
    </div>
  );
}

function Services({ f }) {
  const k = Math.max(0, Math.min(SERVICES.length - 1, Math.floor((f - WHAT) / SVC_LEN)));
  const at = SVCS[k], s = SERVICES[k];
  // each service leaves to the left as the next one comes in (the last one leaves through the spark cut)
  const out = k < SERVICES.length - 1 ? interpolate(f, [at + SVC_LEN - 8, at + SVC_LEN], [0, 1], { ...clamp, easing: easeIn }) : 0;
  const head = sp(f, WHAT + 2);
  return (
    <AbsoluteFill>
      <Stage f={f} beam={0.5} />
      <div style={{ position: "absolute", left: 140, top: 200 }}><Kicker n={`0${k + 1}`} p={head}>What we do</Kicker></div>
      <AbsoluteFill style={{ opacity: 1 - out, transform: `translateX(${-80 * out}px)` }}>
        <div style={{ position: "absolute", left: 140, top: 290, width: 700 }}>
          <div style={{ ...D, fontSize: 96, color: "#fff", ...rise(sp(f, at + 4, 12, 200), 50) }}>{s.name.split(" & ").map((x, i) => i ? <span key={i}><br /><span style={grad}>&amp; {x}</span></span> : <span key={i}>{x}</span>)}</div>
          <div style={{ ...UI, fontWeight: 400, fontSize: 36, lineHeight: 1.35, color: C.soft, marginTop: 30, ...rise(sp(f, at + 12, 14, 200), 30) }}>{s.line}</div>
          {s.price && <Price p={sp(f, at + 22, 10, 260)}>{s.price}</Price>}
        </div>
        <Showcase s={s} f={f} at={at} />
      </AbsoluteFill>
      {/* the five services, the current one lit */}
      <div style={{ position: "absolute", left: 140, top: 960, display: "flex", gap: 14, ...rise(head, 20) }}>
        {RAIL.map((x, i) => (
          <div key={x} style={{ ...M, fontSize: 18, padding: "10px 16px", borderRadius: 99, color: i === k ? "#fff" : C.mute, background: i === k ? "rgba(91,43,255,.35)" : "transparent", border: `1.5px solid ${i === k ? C.uv : "rgba(143,114,255,.22)"}` }}>{x}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ── 4 · the slogan: "Got an idea? Appify it." ──────────────────────────────────────────────────────────────
function Slogan({ f }) {
  const dev = sp(f, IDEA + 2, 14, 160);
  const s = sp(f, SPARK, 8, 300), fly = interpolate(f, [FLY, END], [0, 1], { ...clamp, easing: easeIn });
  const zoom = 1 + 0.9 * fly;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${SPARK_AT[0]}px ${SPARK_AT[1]}px`, filter: `blur(${fly * 6}px)` }}>
        <Stage f={f} beam={0.9} beamX={SPARK_AT[0]} />
        <div style={{ position: "absolute", left: 160, top: 300, opacity: 1 - fly }}>
          <div style={{ ...D, fontSize: 140, color: "#fff", ...pop(sp(f, IDEA + 4, 10, 300)) }}>Got an idea?</div>
          <div style={{ ...D, fontSize: 200, marginTop: 30, ...pop(sp(f, APPIFY, 9, 320), 1.8), transformOrigin: "0 50%" }}><span style={grad}>Appify it.</span></div>
        </div>
        <div style={{ position: "absolute", left: SPARK_AT[0] - 210, top: 255, transform: `translateY(${(1 - Math.min(1, dev)) * 900}px)` }}>
          <Dev width={420} point={f >= SPARK ? Math.min(1, (f - SPARK) / 6) : 0} brow={f >= SPARK ? 18 : 12} lid={0.06} smile={1} happy={f >= SPARK ? 0.9 : 0.4} shock={f >= SPARK && f < SPARK + 8 ? 0.6 : 0} look={-6} tilt={Math.sin(f / 12) * 2} />
        </div>
        {f >= SPARK && (
          <>
            <div style={{ position: "absolute", left: SPARK_AT[0], top: SPARK_AT[1], width: 0, height: 0 }}>
              <div style={{ position: "absolute", left: -90, top: -90, width: 180, height: 180, transform: `scale(${Math.min(1.2, s) * (1 + fly * 1.2)}) rotate(${f * 2}deg)`, filter: `drop-shadow(0 0 ${30 + 50 * fly}px rgba(143,114,255,.95))` }}><Spark size={180} color="#fff" /></div>
            </div>
            <Burst f={f} cx={SPARK_AT[0]} cy={SPARK_AT[1]} start={SPARK + 2} count={50} speed={26} seed="idea" colors={["#fff", C.iris, C.sky]} />
            <Burst f={f} cx={700} cy={640} start={APPIFY + 2} count={40} speed={22} seed="appify" colors={["#fff", C.iris, C.sky]} />
          </>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${SPARK_AT[0]}px ${SPARK_AT[1]}px, rgba(255,255,255,${0.5 * fly}), rgba(143,114,255,${0.35 * fly}) 30%, transparent 65%)` }} />
    </AbsoluteFill>
  );
}

// ── 5 · the wordmark, the slogan, the services, the call to action ──────────────────────────────────────────
function EndCard({ f }) {
  const t = f - END;
  const rev = interpolate(t, [4, 22], [0, 1], { ...clamp, easing: easeOut });
  const spark = sp(t, 22, 8, 320), tag = sp(t, 32, 12, 220), cta = sp(t, 66, 10, 260), dev = sp(t, 18, 14, 150);
  const WW = 820, WH = (WW * 1167) / 3224, wx = (W - WW) / 2, wy = 170;
  const pulse = 1 + 0.02 * Math.sin((t / 15) * Math.PI);
  return (
    <AbsoluteFill>
      <Stage f={f} beam={0.8} />
      <div style={{ position: "absolute", left: wx, top: wy, width: WW, height: WH }}>
        <svg viewBox={WORDMARK.viewBox} width={WW} height={WH} style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - rev) * 100}% 0 0)` }}><path d={WORDMARK.letters} fill="#fff" /></svg>
        <svg viewBox={WORDMARK.viewBox} width={WW} height={WH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={WORDMARK.spark} fill={C.iris} style={{ transformBox: "fill-box", transformOrigin: "50% 50%", transform: `scale(${Math.min(1.3, spark)}) rotate(${(1 - Math.min(1, spark)) * 120}deg)` }} />
        </svg>
      </div>
      <Burst f={f} cx={wx + WW * ((2118.5 + 20) / 3224)} cy={wy + WH * ((-750.9 + 917) / 1167)} start={END + 22} count={60} speed={30} seed="end" colors={["#fff", C.iris, C.sky]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 510, textAlign: "center", ...D, fontSize: 80, color: "#fff", letterSpacing: "-0.03em", ...rise(tag, 30) }}>Got an idea? <span style={grad}>Appify it.</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "flex", justifyContent: "center", gap: 16 }}>
        {RAIL.map((s, k) => <div key={s} style={{ padding: "12px 22px", borderRadius: 99, border: "2px solid rgba(143,114,255,.4)", background: "rgba(17,15,30,.8)", ...UI, fontSize: 28, color: "#fff", ...pop(sp(t, 44 + k * 4, 10, 280), 1.3) }}>{s}</div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", alignItems: "center", gap: 28, opacity: Math.min(1, cta * 2), transform: `scale(${interpolate(Math.min(cta, 1.1), [0, 1], [1.4, 1]) * pulse})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px 22px 40px", borderRadius: 99, background: "linear-gradient(110deg, #4A1FF0, #5B2BFF 40%, #7B57FF)", boxShadow: "0 24px 70px rgba(91,43,255,.7), inset 0 2px 0 rgba(255,255,255,.3)" }}>
          <span style={{ ...D, fontSize: 52, color: "#fff", letterSpacing: "-0.03em" }}>Get a free prototype</span>
          <span style={{ width: 62, height: 62, borderRadius: 31, background: "#fff", display: "grid", placeItems: "center", color: C.uv, ...UI, fontSize: 38 }}>→</span>
        </div>
        <span style={{ ...M, fontSize: 28, color: "rgba(255,255,255,.75)" }}>appify-lb.com</span>
      </div>
      <div style={{ position: "absolute", left: 110, top: 540, transform: `translateY(${(1 - Math.min(1, dev)) * 700}px)` }}>
        <Dev width={230} thumbs={1} brow={16} lid={0.08} smile={1} happy={1} look={8} tilt={Math.sin(t / 8) * 2} />
      </div>
      <div style={{ position: "absolute", right: 130, top: 960, ...M, fontSize: 22, color: C.mute, opacity: Math.min(1, tag) }}>Made in Lebanon</div>
    </AbsoluteFill>
  );
}

const SCENES = [Hello, Mission, Services, Slogan, EndCard];
export const Intro = ({ music = true }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 10;
  // every cut opens through a spark: from Dev's idea into the end card, from the centre otherwise
  const [cx, cy] = CUTS[i - 1] === END ? SPARK_AT : [W / 2, H / 2];
  const p = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.3);
  const Scene = (k) => { const S = SCENES[k]; return <S f={f} />; };
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
      {inCut && Scene(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(cx, cy, R, 0.3)}')` } : undefined}>{Scene(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(cx, cy, R, 0.3)} fill="none" stroke={C.iris} strokeWidth={16 * (1 - p)} /></svg>}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.18} />}
      <Vignette strength={0.25} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};
