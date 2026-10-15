// Appify, Apple-style launch film (Apple mode). A Mac screen drawn in code: thin menu bar, the black notch at the top
// centre growing into one widget per scene, a macOS gradient wallpaper per scene and one caption below the notch with
// its last words tinted. Opens on "hello", closes with the notch back at rest over the Appify wordmark.
// Every word is from Appify's own site copy; widget filler is grey lines.
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HELLO, SCENE0, SCENE_LEN, SCENES, sceneAt, END } from "./timing.js";
import { useFonts } from "./fx.jsx";
import { fonts, aspring, chain, type, MenuBar, Notch, Wallpaper, Caption, Lines, Hello, HELLO_D } from "./apple.jsx";
import { WORDMARK, sparkPath } from "./brand.js";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const UV = "#5B2BFF", YELLOW = "#FFD23F";
const win = (f, a, b, fade = 8) => interpolate(f, [a - fade, a + fade, b - fade, b + fade], [0, 1, 1, 0], clamp);
const Mono = ({ children, style }) => <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", ...style }}>{children}</span>;

// ── the widgets that live in the notch (laid out in 1920-wide px, the notch scales them) ─────────────────────
function Web({ t }) {
  const p = aspring(t, 8, 1, 0.45);
  return (
    <div style={{ display: "flex", gap: 34, padding: "56px 40px 0" }}>
      <div style={{ width: 430, height: 210, borderRadius: 18, background: "#15171E", overflow: "hidden", opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
        <div style={{ height: 30, display: "flex", alignItems: "center", gap: 7, padding: "0 14px" }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 9, height: 9, borderRadius: 9, background: c }} />)}<i style={{ marginLeft: 12, flex: 1, height: 8, borderRadius: 8, background: "rgba(255,255,255,.12)" }} /></div>
        <div style={{ margin: "6px 14px", height: 96, borderRadius: 12, background: "linear-gradient(120deg, #2F6BFF, #74C6FF)" }} />
        <div style={{ padding: "8px 14px" }}><Lines n={2} w={[0.9, 0.55]} h={8} gap={8} /></div>
      </div>
      <div style={{ paddingTop: 24, opacity: aspring(t, 14, 1, 0.45) }}>
        <div style={{ ...type(92), color: "#fff" }}>$0</div>
        <Mono>a month</Mono>
        <div style={{ ...type(30), color: "rgba(255,255,255,.75)", marginTop: 22 }}>$360, paid once</div>
      </div>
    </div>
  );
}
function Anim({ t }) {
  const p = aspring(t, 8, 1, 0.45), x = (u) => 40 + u * 380, y = (u) => 110 + Math.sin(u * Math.PI * 2) * 46;
  const u0 = ((t - 8) / 60) % 1;
  return (
    <div style={{ display: "flex", gap: 34, padding: "56px 40px 0", alignItems: "flex-start" }}>
      <div style={{ position: "relative", width: 470, height: 210, borderRadius: 18, background: "radial-gradient(circle at 30% 30%, #8F72FF55, transparent 60%), #120B2E", overflow: "hidden", opacity: p }}>
        <svg width="470" height="210" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 14 }, (_, k) => { const uu = Math.max(0, u0 - k * 0.018); return <circle key={k} cx={x(uu)} cy={y(uu)} r={7 - k * 0.45} fill={UV} opacity={0.6 - k * 0.04} />; })}
          <path d={sparkPath(x(u0), y(u0), 22, 0.22)} fill={YELLOW} />
        </svg>
      </div>
      <div style={{ paddingTop: 30, opacity: aspring(t, 14, 1, 0.45) }}><Mono>from</Mono><div style={{ ...type(92), color: "#fff" }}>$500</div></div>
    </div>
  );
}
function Apps({ t }) {
  const Phone = ({ i, label }) => { const p = aspring(t, 8 + i * 5, 1, 0.45); return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <div style={{ width: 118, height: 222, borderRadius: 26, border: "3px solid rgba(255,255,255,.4)", padding: "26px 14px", display: "grid", alignContent: "start", gap: 12 }}>
        <div style={{ height: 70, borderRadius: 12, background: i ? "linear-gradient(120deg,#14B8A6,#5EEAD4)" : "linear-gradient(120deg,#5EEAD4,#14B8A6)" }} /><Lines n={3} h={7} gap={8} />
      </div>
      <Mono>{label}</Mono>
    </div>); };
  return <div style={{ display: "flex", justifyContent: "center", gap: 90, paddingTop: 50 }}><Phone i={0} label="iOS" /><Phone i={1} label="Android" /></div>;
}
function Motion({ t }) {
  const F = [["9:16", 90, 160], ["4:5", 128, 160], ["16:9", 284, 160]];
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 34, paddingTop: 66 }}>
      {F.map(([l, w, h], i) => { const p = aspring(t, 8 + i * 5, 1, 0.45), play = interpolate(t, [12 + i * 5, SCENE_LEN], [0, 1], clamp); return (
        <div key={l} style={{ display: "grid", gap: 12, justifyItems: "center", opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
          <div style={{ position: "relative", width: w, height: h, borderRadius: 14, overflow: "hidden", background: "linear-gradient(140deg, #F0386B, #FF9A3C)" }}>
            <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: "absolute", left: w / 2 - 20, top: h / 2 - 26 }}><path d="M14 10 L30 20 L14 30 Z" fill="rgba(255,255,255,.9)" /></svg>
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, height: 3, borderRadius: 3, background: "rgba(255,255,255,.3)" }}><div style={{ width: `${play * 100}%`, height: "100%", background: "#fff", borderRadius: 3 }} /></div>
          </div>
          <Mono>{l}</Mono>
        </div>); })}
    </div>
  );
}
function Ads({ t }) {
  const P = ["Objective", "Targeting", "Retargeting"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 40, padding: "60px 50px 0" }}>
      <svg width="150" height="150" viewBox="0 0 150 150">{[66, 46, 26].map((r, i) => <circle key={r} cx="75" cy="75" r={r * aspring(t, 6 + i * 4, 1, 0.45)} fill="none" stroke={i === 2 ? "#A3E635" : "rgba(255,255,255,.35)"} strokeWidth={i === 2 ? 5 : 2.5} />)}<circle cx="75" cy="75" r={8 * aspring(t, 20, 1, 0.35)} fill="#A3E635" /></svg>
      <div style={{ display: "grid", gap: 14 }}>
        {P.map((x, i) => { const on = aspring(t, 12 + i * 8, 1, 0.35); return <div key={x} style={{ ...type(28), color: "#fff", padding: "10px 22px", borderRadius: 999, border: `2px solid rgba(163,230,53,${0.25 + 0.75 * on})`, background: `rgba(34,197,94,${0.22 * on})`, opacity: 0.35 + 0.65 * on }}>{x}</div>; })}
      </div>
    </div>
  );
}
function Days({ t }) {
  const done = Math.min(7, Math.floor(interpolate(t, [10, 56], [0, 7.99], clamp)));
  const ok = aspring(t, 58, 1, 0.35);
  return (
    <div style={{ padding: "64px 56px 0" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {Array.from({ length: 7 }, (_, i) => <i key={i} style={{ flex: 1, height: 6, borderRadius: 6, background: i < done ? YELLOW : "rgba(255,255,255,.18)", boxShadow: i < done ? "0 0 14px rgba(255,210,63,.5)" : "none" }} />)}
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ opacity: ok, transform: `scale(${0.6 + 0.4 * ok})` }}><circle cx="22" cy="22" r="20" fill={YELLOW} /><path d="M13 23 L19.5 29 L31 16" fill="none" stroke="#3A2A04" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingRight: 60 }}><Mono>Day 1</Mono><Mono>Day 7</Mono></div>
    </div>
  );
}
const WIDGET = { web: Web, anim: Anim, apps: Apps, motion: Motion, ads: Ads, days: Days };

export const Main = () => {
  useFonts(fonts);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const u = W / 1920;
  // the notch, worked out from the start of the film: open on black for hello, each scene's widget size, rest at the end
  const wKeys = [[0, 600], ...SCENES.map((s, i) => [sceneAt(i), s.w]), [END, 190]];
  const hKeys = [[0, 280], ...SCENES.map((s, i) => [sceneAt(i), s.h]), [END, 34]];
  const bar = interpolate(f, [SCENE0 - 12, SCENE0, END - 6, END + 6], [0, 1, 1, 0], clamp);
  const helloOut = interpolate(f, [SCENE0 - 14, SCENE0], [1, 0], clamp);
  const mark = aspring(f, END + 14, 1, 0.55);
  const tagIn = END + 30;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((s, i) => { const a = sceneAt(i), b = a + SCENE_LEN; return <Wallpaper key={s.key} base={s.wall[0]} a={s.wall[1]} b={s.wall[2]} drift={(f - a) / 40} opacity={win(f, a, i === SCENES.length - 1 ? b + 2 : b, 10)} />; })}
      <MenuBar items={["Appify", "Websites", "Apps", "Motion", "Ads"]} opacity={bar} />
      <Notch f={f} wKeys={wKeys} hKeys={hKeys}>
        <div style={{ width: 1000, height: 400, transform: `scale(${u})`, transformOrigin: "0 0" }}>
          {SCENES.map((s, i) => { const a = sceneAt(i), b = a + SCENE_LEN, o = win(f, a + 6, b - 2, 6), Wd = WIDGET[s.key];
            return o > 0 && <div key={s.key} style={{ position: "absolute", left: 0, top: 0, width: s.w, height: s.h, opacity: o, filter: `blur(${(1 - o) * 8}px)` }}><Wd t={f - a} /></div>; })}
        </div>
      </Notch>
      {f < SCENE0 + 2 && <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.36, display: "flex", justifyContent: "center", opacity: helloOut }}><Hello f={f} at={HELLO + 10} d={HELLO_D} width={760 * u} /></div>}
      {SCENES.map((s, i) => { const a = sceneAt(i), b = a + SCENE_LEN; return f >= a && f < b + 6 && <div key={s.key} style={{ opacity: interpolate(f, [b - 6, b + 4], [1, 0], clamp) }}><Caption f={f} at={a + 10} text={s.caption} tintWords={s.tint} tint={s.tintC} size={76 * u} top={H * 0.58} /></div>; })}
      {f >= END && (
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.38, display: "grid", justifyItems: "center" }}>
          <svg viewBox={WORDMARK.viewBox} width={560 * u} height={560 * u * 1167 / 3224} style={{ opacity: mark, transform: `scale(${0.96 + 0.04 * mark})`, filter: `blur(${(1 - mark) * 10}px)` }}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={YELLOW} /></svg>
          <div style={{ marginTop: 34 * u, ...type(52 * u), color: "#fff", opacity: aspring(f, tagIn, 1, 0.5) }}>Ideas, <span style={{ color: "rgba(255,255,255,.55)" }}>appified.</span></div>
          <div style={{ marginTop: 26 * u, ...type(20 * u), color: "rgba(255,255,255,.45)", letterSpacing: "0.04em", opacity: aspring(f, tagIn + 14, 1, 0.5) }}>appify-lb.com · @appifylb</div>
        </div>
      )}
      <Audio src={staticFile("sound.wav")} />
    </AbsoluteFill>
  );
};
