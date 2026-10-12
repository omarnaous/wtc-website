// Instagram covers: one template for every post so the profile grid reads as one brand.
// 9:16 stills; everything that matters sits in the centre 1080x1440 band (the 3:4 profile-grid crop).
// Same parts on every cover: kicker pill, big Sora hook with one accent line, one visual, Dev with a speech bubble,
// the wordmark. Covers alternate dark / light in posting order so the 3-column grid forms a checkerboard.
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";
import { SCENES, BG as SCENE_BG } from "./Main.jsx";

const C = { ink: "#0A0913", ink2: "#17142B", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", alert: "#F0384F", mute: "#6D6788" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.95 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const FONTS = [["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]];

const Spark = ({ size, color, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const Wordmark = ({ width, ink, spark, style }) => (
  <svg viewBox={WORDMARK.viewBox} width={width} height={width * 1167 / 3224} style={style}><path d={WORDMARK.letters} fill={ink} /><path d={WORDMARK.spark} fill={spark} /></svg>
);

function Frame({ dark, kicker, children }) {
  useFonts(FONTS);
  const { width: W, height: H } = useVideoConfig();
  const bt = (H - 1440) / 2, ink = dark ? "#fff" : C.ink;
  const line = dark ? "rgba(143,114,255,.09)" : "rgba(91,43,255,.11)";
  return (
    <AbsoluteFill style={{ background: dark ? C.ink : C.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${line} 1.5px, transparent 1.5px)`, backgroundSize: "60px 60px", backgroundPosition: `${W / 2}px 0` }} />
      <AbsoluteFill style={{ background: dark ? "radial-gradient(circle at 60% 55%, rgba(91,43,255,.55), transparent 60%)" : "radial-gradient(circle at 60% 55%, rgba(143,114,255,.22), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bt + 70, display: "flex", justifyContent: "center" }}>
        <div style={{ ...M, fontSize: 26, color: dark ? C.sky : C.uv, padding: "12px 26px", borderRadius: 99, border: `3px solid ${dark ? "rgba(116,198,255,.5)" : "rgba(91,43,255,.35)"}`, display: "flex", alignItems: "center", gap: 12 }}>
          <Spark size={24} color={dark ? C.iris : C.uv} />{kicker}
        </div>
      </div>
      <AbsoluteFill style={{ top: bt, height: 1440 }}>{children}</AbsoluteFill>
      <Wordmark width={200} ink={ink} spark={dark ? C.iris : C.uv} style={{ position: "absolute", right: 60, top: bt + 1340 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(10,9,19,.18))", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
}

const Hook = ({ lines, top = 150 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", display: "grid", justifyItems: "center", gap: 6 }}>
    {lines.map(([text, size, color], i) => <div key={i} style={{ ...D, fontSize: size, color, whiteSpace: "nowrap" }}>{text}</div>)}
  </div>
);

function Mascot({ x, feet, width = 340, bubble, bubbleSide = "right", bx, by, dark, ...pose }) {
  const h = width * 830 / 420;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: feet - h * 0.98 }}>
        <Dev width={width} brow={16} lid={0.08} smile={1} look={4} {...pose} />
      </div>
      {bubble && (
        <div style={{ position: "absolute", top: by ?? feet - h * 1.02, left: bx ?? (bubbleSide === "right" ? x + width * 0.62 : x - 40), padding: "18px 26px", background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 18, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: "Mono", fontSize: 38, color: C.ink, whiteSpace: "nowrap" }}>
          {bubble}
        </div>
      )}
    </>
  );
}

// ── post 1 · logo reveal: meet appify ─────────────────────────────────────────────────────────────
export const CoverLogo = () => (
  <Frame dark kicker="new here?">
    <Hook lines={[["Meet", 170, "#fff"]]} top={170} />
    <Wordmark width={860} ink="#fff" spark={C.iris} style={{ position: "absolute", left: 110, top: 360, filter: "drop-shadow(0 0 40px rgba(143,114,255,.55))" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", ...D, fontSize: 64, color: "rgba(255,255,255,.92)" }}>Ideas, <span style={{ color: C.sky }}>appified.</span></div>
    <div style={{ position: "absolute", left: 430, right: 50, top: 830, display: "flex", flexWrap: "wrap", gap: 16 }}>
      {["Websites", "Mobile apps", "Motion graphics", "AI agents"].map((s) => (
        <div key={s} style={{ padding: "16px 26px", borderRadius: 99, background: "rgba(143,114,255,.16)", border: "3px solid rgba(143,114,255,.5)", fontFamily: "UI", fontWeight: 600, fontSize: 34, color: "#fff" }}>{s}</div>
      ))}
    </div>
    <Mascot x={40} feet={1410} width={360} bubble="hi, I'm Dev!" bx={420} by={1050} wave={1} waveAng={-10} dark />
  </Frame>
);

// ── post 2 · subscription killer: still paying $39/month ──────────────────────────────────────────
const MONTHS = ["AUG", "JUL", "JUN", "MAY", "APR", "MAR", "FEB"];
export const CoverStore = () => (
  <Frame kicker="store owners">
    <Hook lines={[["Still paying", 112, C.ink], ["$39/month", 176, C.alert], ["for your store?", 112, C.ink]]} />
    <div style={{ position: "absolute", left: 480, top: 800, width: 500, padding: "34px 34px 28px", background: "#fff", borderRadius: 10, boxShadow: "0 30px 60px rgba(10,9,19,.18)", transform: "rotate(4deg)", fontFamily: "Mono", color: C.ink }}>
      <div style={{ height: 22, margin: "-34px -34px 24px", background: C.ink, borderRadius: "10px 10px 0 0" }} />
      {MONTHS.map((m) => (
        <div key={m} style={{ display: "flex", justifyContent: "space-between", fontSize: 26, padding: "9px 0", borderBottom: "2px dashed rgba(10,9,19,.12)" }}>
          <span>{m} 26</span><span style={{ color: C.mute }}>Monthly plan</span><span style={{ color: C.alert }}>$39.00</span>
        </div>
      ))}
      <div style={{ ...M, fontSize: 18, textAlign: "center", marginTop: 20, color: C.mute }}>subscription · no end date</div>
    </div>
    <Mascot x={30} feet={1410} width={360} bubble="Are you still paying?" shock={1} smile={0.2} />
  </Frame>
);

// ── post 3 · motion vs a static product photo: 1 like (Mom) ───────────────────────────────────────
export const CoverProduct = () => (
  <Frame dark kicker="pov">
    <Hook lines={[["Another", 120, "#fff"], ["product photo.", 120, "#fff"], ["1 like (Mom).", 150, C.alert]]} />
    <div style={{ position: "absolute", left: 440, top: 660, width: 540, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.5)", transform: "rotate(5deg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
        <div style={{ width: 42, height: 42, borderRadius: 99, background: "#ddd" }} /><div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 24, color: "#111" }}>your.store</div>
      </div>
      <Img src={staticFile("cover-still.jpg")} style={{ width: 540, height: 410, objectFit: "cover", filter: "saturate(.75)", display: "block" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 20px", fontFamily: "UI", fontSize: 26, color: "#222" }}>
        <span style={{ fontSize: 36, color: C.alert }}>♥</span><span>1 like</span>
        <span style={{ padding: "4px 12px", borderRadius: 99, background: "rgba(240,56,79,.12)", color: C.alert, fontWeight: 600 }}>liked by mom</span>
      </div>
    </div>
    <Mascot x={30} feet={1410} width={360} bubble="your mom." wink={1} look={6} />
  </Frame>
);

// ── post 4 · showreel: 9 motion styles, pick one ──────────────────────────────────────────────────
const COVER_T = [40, 38, 34, 40, 20, 33, 26, 3, 40];
export const CoverShowreel = () => {
  const tile = 214, gap = 16, gx = 1080 - 50 - (3 * tile + 2 * gap), gy = 560;
  return (
    <Frame kicker="motion graphics">
      <Hook lines={[["9 MOTION", 160, C.ink]]} top={150} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 305, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, ...D, fontSize: 160, color: C.uv }}>STYLES<Spark size={100} color={C.iris} /></div>
      {SCENES.map((Sc, k) => (
        <div key={k} style={{ position: "absolute", left: gx + (k % 3) * (tile + gap), top: gy + Math.floor(k / 3) * (tile + gap), width: tile, height: tile, borderRadius: 26, overflow: "hidden", background: SCENE_BG[k], boxShadow: "0 16px 36px rgba(10,9,19,.25)" }}>
          <div style={{ position: "absolute", width: 1080, height: 1080, transform: `scale(${tile / 1080})`, transformOrigin: "0 0" }}>
            <AbsoluteFill style={{ background: SCENE_BG[k], transform: `translateY(${k === 3 ? 90 : 0}px)` }}><Sc t={COVER_T[k]} W={1080} H={1080} u={1} /></AbsoluteFill>
          </div>
          <div style={{ position: "absolute", left: 10, top: 10, width: 52, height: 52, borderRadius: 99, background: C.sky, color: C.ink, display: "grid", placeItems: "center", ...D, fontSize: 30 }}>{k + 1}</div>
        </div>
      ))}
      <Mascot x={10} feet={1410} width={330} bubble="pick one!" bx={20} by={700} point={1} look={8} />
    </Frame>
  );
};

// ── profile pictures: Dev's head and shoulders on a bold brand background (IG crops to a circle) ──
export function Avatar({ variant = "uv" }) {
  useFonts(FONTS);
  const bg = {
    uv: "radial-gradient(circle at 50% 38%, #9C84FF 0%, #5B2BFF 48%, #2A1287 100%)",
    ink: "radial-gradient(circle at 50% 40%, #3B2A8F 0%, #17142B 55%, #0A0913 100%)",
    sky: "radial-gradient(circle at 50% 38%, #B9E3FF 0%, #74C6FF 50%, #3E8FD6 100%)",
  }[variant];
  const ring = { uv: "rgba(255,255,255,.22)", ink: "rgba(143,114,255,.45)", sky: "rgba(255,255,255,.45)" }[variant];
  const spark = { uv: "#fff", ink: C.iris, sky: "#fff" }[variant];
  const w = 700, s = w / 420;   // Dev scale: head + shoulders fill the circle
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      {[380, 470].map((r, i) => <div key={r} style={{ position: "absolute", left: 540 - r, top: 470 - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `${i ? 4 : 6}px solid ${ring}`, opacity: i ? 0.5 : 1 }} />)}
      <div style={{ position: "absolute", left: 540 - (300 - 90) * s, top: 120 - (150 - 50) * s }}>
        <Dev width={w} brow={16} lid={0.08} smile={1} look={0} />
      </div>
      <Spark size={150} color={spark} style={{ position: "absolute", left: 770, top: 120, filter: "drop-shadow(0 0 24px rgba(255,255,255,.6))" }} />
      <Spark size={70} color={spark} style={{ position: "absolute", left: 230, top: 250, opacity: 0.8 }} />
    </AbsoluteFill>
  );
}
export const AvatarUV = () => <Avatar variant="uv" />;
export const AvatarInk = () => <Avatar variant="ink" />;
export const AvatarSky = () => <Avatar variant="sky" />;
