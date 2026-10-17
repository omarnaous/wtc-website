// Appify's intro for the website hero (16:9, tap to play with sound). The one idea: "Ideas, appified." Dev lights a
// spark (the idea), the spark flies at the camera and every cut after it opens through a spark onto real Appify work:
// websites (a live client store and a concept build), a mobile app, motion graphics. It ends on the wordmark, whose
// i-dot is that same spark, with the services and "Book a call".
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { DEV_IN, HELLO, IDEA, SPARK, FLY, WEB, SECOND, APP, MOTION, END, CUTS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, Burst, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const W = 1920, H = 1080;
const C = { ink: "#0A0913", ink2: "#17142B", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", mute: "#8A84A3", green: "#39E29B" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.98 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 230) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.5) => ({ opacity: Math.min(1, p * 2.5), transform: `scale(${interpolate(Math.min(p, 1.15), [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.iris, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const grad = { background: `linear-gradient(100deg, ${C.iris}, ${C.sky} 60%, #C9B8FF)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
const SPARK_AT = [1290, 205];   // where Dev's idea lights up

function Stage({ f, beam = 1 }) {
  return (
    <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "80px 80px", backgroundPosition: `0 ${f * 0.6}px`, WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, #000 30%, transparent 78%)", maskImage: "radial-gradient(ellipse 80% 70% at 60% 40%, #000 30%, transparent 78%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 55% at 66% 55%, rgba(91,43,255,.45), transparent 70%), radial-gradient(ellipse 40% 30% at 85% 10%, rgba(116,198,255,.12), transparent 70%)" }} />
      <div style={{ position: "absolute", left: 1290 - 330, top: -120, width: 660, height: 1300, opacity: beam, background: "linear-gradient(180deg, rgba(220,210,255,.22), rgba(143,114,255,.05) 60%, transparent 85%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(16px)", transform: `rotate(${6 + Math.sin(f / 40)}deg)`, transformOrigin: "50% 0" }} />
    </>
  );
}
const Kicker = ({ n, children, p }) => <div style={{ ...M, fontSize: 24, color: C.iris, display: "flex", gap: 16, alignItems: "center", ...rise(p, 20) }}><span style={{ color: C.sky, padding: "8px 12px", border: "2px solid rgba(116,198,255,.4)", borderRadius: 10 }}>{n}</span>{children}</div>;
const Price = ({ children, p }) => <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 34, padding: "16px 28px", borderRadius: 99, background: "rgba(91,43,255,.18)", border: `2px solid ${C.uv}`, ...UI, fontSize: 36, color: "#fff", ...pop(p, 1.3), transformOrigin: "0 50%" }}><Spark size={26} />{children}</div>;
const Pill = ({ children, p, color = C.green }) => <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 99, background: "rgba(17,15,30,.9)", border: `2px solid ${color}88`, ...UI, fontSize: 30, color: "#fff", ...pop(p, 1.4), transformOrigin: "0 50%" }}><span style={{ width: 14, height: 14, borderRadius: 7, background: color }} />{children}</div>;
const Clip = ({ src, from, at, style, fit = "cover" }) => (
  <div style={{ overflow: "hidden", background: "#000", ...style }}>
    <Sequence from={at} layout="none"><OffthreadVideo src={staticFile(src)} startFrom={from} muted style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }} /></Sequence>
  </div>
);

// ── 1 · hello: Dev in the spotlight, an idea lights up ───────────────────────────────────────────────────
function Hello({ f }) {
  const dev = sp(f, DEV_IN, 14, 140), idea = f >= IDEA - 4;
  const out = interpolate(f, [IDEA - 6, IDEA], [0, 1], clamp);
  const s = sp(f, SPARK, 8, 300), fly = interpolate(f, [FLY, WEB], [0, 1], { ...clamp, easing: easeIn });
  // the camera pushes into the idea: the whole scene scales up around the spark while it glows
  const zoom = 1 + 0.9 * fly;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${SPARK_AT[0]}px ${SPARK_AT[1]}px`, filter: `blur(${fly * 6}px)` }}>
      <Stage f={f} beam={interpolate(f, [0, 20], [0, 1], clamp)} />
      <div style={{ position: "absolute", left: 160, top: 330 }}>
        {!idea && <div style={{ opacity: 1 - out }}>
          <div style={{ ...D, fontSize: 120, color: "#fff", ...pop(sp(f, HELLO, 10, 300)) }}>Hi, we're</div>
          <div style={{ ...D, fontSize: 200, marginTop: 10, ...pop(sp(f, HELLO + 8, 10, 300)) }}><span style={grad}>Appify.</span></div>
        </div>}
        {idea && <div style={{ transform: `translateX(${-200 * fly}px)`, opacity: 1 - fly }}>
          <div style={{ ...D, fontSize: 120, color: "#fff", ...pop(sp(f, IDEA, 10, 300)) }}>Got an</div>
          <div style={{ ...D, fontSize: 200, marginTop: 10, ...pop(sp(f, IDEA + 6, 10, 300)) }}><span style={grad}>idea?</span></div>
        </div>}
      </div>
      <div style={{ position: "absolute", left: 1290 - 210, top: 255, transform: `translateY(${(1 - Math.min(1, dev)) * 900}px)` }}>
        <Dev width={420} wave={f < SPARK ? 1 : 0} waveAng={Math.sin(f / 3) * 18} point={f >= SPARK ? Math.min(1, (f - SPARK) / 6) : 0} brow={f >= SPARK ? 18 : 12} lid={0.06} smile={1} happy={f >= SPARK ? 0.8 : 0.3} shock={f >= SPARK && f < SPARK + 8 ? 0.6 : 0} look={-4} tilt={Math.sin(f / 12) * 2} />
      </div>
      {f >= SPARK && (
        <>
          <div style={{ position: "absolute", left: SPARK_AT[0], top: SPARK_AT[1], width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -90, top: -90, width: 180, height: 180, transform: `scale(${Math.min(1.2, s) * (1 + fly * 1.2)}) rotate(${f * 2}deg)`, filter: `drop-shadow(0 0 ${30 + 50 * fly}px rgba(143,114,255,.95))` }}><Spark size={180} color="#fff" /></div>
          </div>
          <Burst f={f} cx={SPARK_AT[0]} cy={SPARK_AT[1]} start={SPARK + 2} count={50} speed={26} seed="idea" colors={["#fff", C.iris, C.sky]} />
        </>
      )}
      </AbsoluteFill>
      {/* the spark's light blooms toward the lens just before the cut opens through it */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${SPARK_AT[0]}px ${SPARK_AT[1]}px, rgba(255,255,255,${0.5 * fly}), rgba(143,114,255,${0.35 * fly}) 30%, transparent 65%)` }} />
    </AbsoluteFill>
  );
}

// ── 2 · websites & web apps ─────────────────────────────────────────────────────────────────────────────
function Web({ f }) {
  const t = f - WEB, br = sp(f, WEB + 2, 13, 180), od = sp(f, SECOND, 12, 190);
  return (
    <AbsoluteFill>
      <Stage f={f} beam={0.5} />
      <div style={{ position: "absolute", left: 140, top: 250, width: 640 }}>
        <Kicker n="01" p={sp(f, WEB + 4)}>What we build</Kicker>
        <div style={{ ...D, fontSize: 104, color: "#fff", marginTop: 30, whiteSpace: "nowrap", ...rise(sp(f, WEB + 8, 12, 200), 50) }}>Websites<br /><span style={grad}>&amp; web apps</span></div>
        <Price p={sp(f, WEB + 20, 10, 260)}>from $360</Price>
      </div>
      {/* browser window: the live WTC store launch */}
      <div style={{ position: "absolute", left: 800, top: 200, width: 1000, borderRadius: 26, overflow: "hidden", background: "#17152A", border: "2px solid rgba(143,114,255,.4)", boxShadow: "0 50px 120px -30px rgba(91,43,255,.6)", ...rise(br, 120), transform: `translateY(${(1 - Math.min(1, br)) * 120}px) rotate(${(1 - Math.min(1, br)) * 3}deg)` }}>
        <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#1D1A33" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <span style={{ marginLeft: 16, flex: 1, height: 30, borderRadius: 10, background: "rgba(10,9,19,.7)", display: "flex", alignItems: "center", padding: "0 14px", fontFamily: "Mono", fontSize: 18, color: C.mute }}>watchtradechronicles.com</span>
        </div>
        <Clip src="wtc-launch.mp4" from={15} at={WEB} style={{ width: 1000, height: 562 }} />
      </div>
      <div style={{ position: "absolute", left: 830, top: 840, ...M, fontSize: 20, color: C.mute, opacity: Math.min(1, br) }}>Watch Trade Chronicles · live client store</div>
      {/* second site: the Oddball concept build */}
      {t >= SECOND - WEB && (
        <div style={{ position: "absolute", left: 1470, top: 470, width: 380, transform: `translateY(${(1 - Math.min(1, od)) * 500}px) rotate(${4 - 2 * Math.min(1, od)}deg)`, opacity: Math.min(1, od * 2) }}>
          <Clip src="oddball.mp4" from={30} at={SECOND} style={{ width: 380, height: 475, borderRadius: 24, border: "3px solid rgba(255,255,255,.18)", boxShadow: "0 40px 80px rgba(0,0,0,.6)" }} />
          <div style={{ ...M, fontSize: 18, color: C.mute, marginTop: 14, textAlign: "right" }}>Oddball · concept build</div>
        </div>
      )}
    </AbsoluteFill>
  );
}

// ── 3 · mobile apps ─────────────────────────────────────────────────────────────────────────────────────
function App({ f }) {
  const card = sp(f, APP + 2, 13, 180);
  return (
    <AbsoluteFill>
      <Stage f={f} beam={0.6} />
      <div style={{ position: "absolute", left: 140, top: 250, width: 860 }}>
        <Kicker n="02" p={sp(f, APP + 4)}>Mobile apps</Kicker>
        <div style={{ ...D, fontSize: 112, color: "#fff", marginTop: 30, whiteSpace: "nowrap", ...rise(sp(f, APP + 8, 12, 200), 50) }}>One app,<br /><span style={grad}>iOS + Android</span></div>
        <Price p={sp(f, APP + 20, 10, 260)}>from $999</Price>
      </div>
      <div style={{ position: "absolute", left: 1010, top: 120, transform: `translateY(${(1 - Math.min(1, card)) * 160}px)`, opacity: Math.min(1, card * 2) }}>
        <Clip src="ecommerce-chat.mp4" from={195} at={APP} style={{ width: 470, height: 836, borderRadius: 40, border: "3px solid rgba(143,114,255,.45)", boxShadow: "0 50px 120px -30px rgba(91,43,255,.7)" }} />
        <div style={{ ...M, fontSize: 18, color: C.mute, marginTop: 14, textAlign: "center" }}>Demo store app · built by Appify</div>
      </div>
      <div style={{ position: "absolute", left: 1530, top: 380, display: "grid", gap: 22 }}>
        <Pill p={sp(f, APP + 30, 9, 300)}>App Store ✓</Pill>
        <Pill p={sp(f, APP + 40, 9, 300)}>Google Play ✓</Pill>
        <Pill p={sp(f, APP + 50, 9, 300)} color={C.iris}>Admin panel</Pill>
      </div>
    </AbsoluteFill>
  );
}

// ── 4 · motion graphics ─────────────────────────────────────────────────────────────────────────────────
function Motion({ f }) {
  const reels = [["balloon.mp4", 15, -4], ["meta-ads.mp4", 20, 0], ["lifetime.mp4", 10, 4]];
  return (
    <AbsoluteFill>
      <Stage f={f} beam={0.6} />
      <div style={{ position: "absolute", left: 140, top: 250, width: 820 }}>
        <Kicker n="03" p={sp(f, MOTION + 4)}>Motion graphics</Kicker>
        <div style={{ ...D, fontSize: 96, color: "#fff", marginTop: 30, whiteSpace: "nowrap", ...rise(sp(f, MOTION + 8, 12, 200), 50) }}>Content that<br /><span style={grad}>stops the scroll</span></div>
        <Price p={sp(f, MOTION + 22, 10, 260)}>3 videos · $199</Price>
      </div>
      {reels.map(([src, from, rot], k) => {
        const p = sp(f, MOTION + 2 + k * 8, 12, 190);
        return (
          <div key={src} style={{ position: "absolute", left: 990 + k * 300, top: 190 + (k === 1 ? -30 : 20), transform: `translateY(${(1 - Math.min(1, p)) * 700}px) rotate(${rot}deg)`, opacity: Math.min(1, p * 2) }}>
            <Clip src={src} from={from} at={MOTION + k * 8} style={{ width: 280, height: 498, borderRadius: 30, border: "3px solid rgba(143,114,255,.4)", boxShadow: "0 40px 90px rgba(0,0,0,.55)" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ── 5 · the wordmark, the services, Book a call ─────────────────────────────────────────────────────────
function EndCard({ f }) {
  const t = f - END;
  const rev = interpolate(t, [4, 22], [0, 1], { ...clamp, easing: easeOut });
  const spark = sp(t, 22, 8, 320), tag = sp(t, 32, 12, 220), cta = sp(t, 66, 10, 260), dev = sp(t, 18, 14, 150);
  const services = ["Websites", "Web apps", "Mobile apps", "Motion graphics", "Meta ads"];
  const WW = 880, WH = (WW * 1167) / 3224, wx = (W - WW) / 2, wy = 200;
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
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", ...D, fontSize: 84, color: "#fff", letterSpacing: "-0.03em", ...rise(tag, 30) }}>Ideas, <span style={grad}>appified.</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", gap: 16 }}>
        {services.map((s, k) => <div key={s} style={{ padding: "12px 22px", borderRadius: 99, border: "2px solid rgba(143,114,255,.4)", background: "rgba(17,15,30,.8)", ...UI, fontSize: 28, color: "#fff", ...pop(sp(t, 44 + k * 4, 10, 280), 1.3) }}>{s}</div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", alignItems: "center", gap: 28, opacity: Math.min(1, cta * 2), transform: `scale(${interpolate(Math.min(cta, 1.1), [0, 1], [1.4, 1]) * pulse})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px 22px 40px", borderRadius: 99, background: "linear-gradient(110deg, #4A1FF0, #5B2BFF 40%, #7B57FF)", boxShadow: "0 24px 70px rgba(91,43,255,.7), inset 0 2px 0 rgba(255,255,255,.3)" }}>
          <span style={{ ...D, fontSize: 56, color: "#fff", letterSpacing: "-0.03em" }}>Book a call</span>
          <span style={{ width: 66, height: 66, borderRadius: 33, background: "#fff", display: "grid", placeItems: "center", color: C.uv, ...UI, fontSize: 40 }}>→</span>
        </div>
        <span style={{ ...M, fontSize: 28, color: "rgba(255,255,255,.75)" }}>appify-lb.com</span>
      </div>
      <div style={{ position: "absolute", left: 120, top: 520, transform: `translateY(${(1 - Math.min(1, dev)) * 700}px)` }}>
        <Dev width={250} thumbs={1} brow={16} lid={0.08} smile={1} happy={1} look={8} tilt={Math.sin(t / 8) * 2} />
      </div>
      <div style={{ position: "absolute", right: 140, top: 560, ...M, fontSize: 22, color: C.mute, opacity: Math.min(1, tag) }}>Made in Lebanon</div>
    </AbsoluteFill>
  );
}

const SCENES = [Hello, Web, App, Motion, EndCard];
export const Intro = ({ music = true }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 10;
  // every cut opens through a spark: from Dev's idea on the first cut, from the centre after that
  const [cx, cy] = i === 1 ? SPARK_AT : [W / 2, H / 2];
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
