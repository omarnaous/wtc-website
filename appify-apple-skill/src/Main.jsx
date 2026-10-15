// Showcase reel for the apple-motion-graphics skill, built with the skill's own kit and rules.
// Every word on screen is a fact about the skill (its formats, its 16 effects, its brief, its check output).
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Audio, staticFile } from "remotion";
import { useFonts, fonts, aspring, chain, clamp, type, Caption, Wallpaper, MenuBar, Notch, Lines, Hello, HELLO_D } from "./apple.jsx";
import { WORDMARK } from "./brand.js";
import { S, FILM, FX, BRIEF, CHECK } from "./timing.js";

const INK = "#1D1D1F", PAPER = "#F5F5F7", BLUE = "#0A84FF", GREEN = "#30D158", ORANGE = "#FF9F0A", PURPLE = "#BF5AF2", YELLOW = "#FFD23F";
const io = Easing.bezier(0.65, 0, 0.35, 1);
const CAP = 1330; // caption line, clear of the IG caption and button column

// Scene wrapper: mounted for [a, b), dissolves out over its last 10 frames (opacity + slight blur, no jump).
function Scene({ f, a, b, children }) {
  if (f < a || f >= b) return null;
  const o = 1 - interpolate(f, [b - 10, b], [0, 1], { ...clamp, easing: io });
  return <AbsoluteFill style={{ opacity: o, filter: `blur(${(1 - o) * 8}px)` }}>{children}</AbsoluteFill>;
}

// Masked type: each line rises out of its own clip.
const Masked = ({ f, at, text, style }) => {
  const p = aspring(f, at, 1, 0.6);
  return <div style={{ overflow: "hidden", paddingBottom: 8 }}><div style={{ ...style, transform: `translateY(${(1 - p) * 110}%)` }}>{text}</div></div>;
};

// ── 1. hello ──────────────────────────────────────────────────────────────────────────────────────
const HelloScene = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 230 }}>
    <Hello f={f} at={8} d={HELLO_D} width={860} stroke={9} dur={52} />
  </AbsoluteFill>
);

// ── 2. title ──────────────────────────────────────────────────────────────────────────────────────
const Title = ({ f }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 230, textAlign: "center" }}>
    <Masked f={f} at={S.title + 4} text="Apple-style motion." style={{ ...type(104), color: "#fff" }} />
    <Masked f={f} at={S.title + 16} text="Built in code." style={{ ...type(104), color: "rgba(255,255,255,.5)" }} />
  </AbsoluteFill>
);

// ── 3. the Mac notch launch film, on a small Mac screen ──────────────────────────────────────────
const SW = 972, SH = 608; // screen inside the bezel (16:10)
function FilmScene({ f }) {
  const a = S.film, enter = aspring(f, a, 1, 0.6);
  const wKeys = [[0, 200], [a + FILM.open, 760], [a + FILM.second, 560], [a + FILM.close, 200]];
  const hKeys = [[0, 34], [a + FILM.open + 2, 230], [a + FILM.second + 2, 170], [a + FILM.close + 2, 34]];
  const orange = interpolate(f, [a + FILM.second - 6, a + FILM.second + 10], [0, 1], { ...clamp, easing: io });
  const content = (i, from, to) => Math.min(aspring(f, from + 10, 1, 0.35), 1 - interpolate(f, [to - 6, to], [0, 1], clamp));
  const widget = (accent, v) => v > 0.001 && (
    <div style={{ position: "absolute", inset: 0, padding: "34px 24px 18px", display: "flex", gap: 14, opacity: v }}>
      <div style={{ width: 70, height: 70, borderRadius: 18, background: accent, flex: "none" }} />
      <div style={{ flex: 1, paddingTop: 8 }}><Lines n={3} h={7} gap={9} /></div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: (1080 - SW - 28) / 2, top: 487, width: SW + 28, height: SH + 28, borderRadius: 36, background: "#0b0b0c",
        boxShadow: "0 0 0 2px #2c2c2e, 0 40px 120px rgba(47,107,255,.25)", opacity: enter, transform: `scale(${0.94 + 0.06 * enter})`, filter: `blur(${(1 - enter) * 10}px)` }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH, borderRadius: 22, overflow: "hidden", background: "#000" }}>
          <Wallpaper base="#0B1E4A" a="#2F6BFF" b="#9B5CFF" drift={(f - a) / 75} />
          <Wallpaper base="#2A0C1E" a="#FF6A3D" b="#FF2D8F" drift={(f - a) / 75} opacity={orange} />
          <MenuBar items={["Film", "File", "Edit", "View", "Window"]} glyph={false} />
          <Notch f={f} wKeys={wKeys} hKeys={hKeys}>
            {widget("#2F6BFF", content(0, a + FILM.open, a + FILM.second))}
            {widget("#FF6A3D", content(1, a + FILM.second, a + FILM.close))}
          </Notch>
        </div>
      </div>
      <Caption f={f} at={a + 40} text="Mac notch launch films." tint="rgba(170,200,255,.8)" size={68} top={CAP} />
    </AbsoluteFill>
  );
}

// ── 4. effects: button -> player (effect 01), then it becomes tile 01 of the 16 ──────────────────
const GROUP = [BLUE, GREEN, ORANGE, PURPLE]; // Interfaces, Data and lists, Type, Systems (references/effects.md)
const PLAY = [[[7, 3], [15, 8], [15, 18], [7, 23]], [[15, 8], [23, 13], [23, 13], [15, 18]]];
const PAUSE = [[[6, 3], [11, 3], [11, 23], [6, 23]], [[15, 3], [20, 3], [20, 23], [15, 23]]];
const playPause = (t) => PLAY.map((q, i) => "M" + q.map(([x, y], j) => `${x + (PAUSE[i][j][0] - x) * t} ${y + (PAUSE[i][j][1] - y) * t}`).join(" L") + " Z").join(" ");
const T = 200, G = 22, GX = (1080 - (4 * T + 3 * G)) / 2, GY = 372;
const tile = (i) => ({ x: GX + (i % 4) * (T + G), y: GY + Math.floor(i / 4) * (T + G) });

function Effects({ f }) {
  const a = S.fx, l = f - a;
  const p = interpolate(l, [FX.move, FX.moveEnd], [0, 1], { ...clamp, easing: io });        // button -> player
  const body = interpolate(p, [0.5, 1], [0, 1], clamp) * (1 - aspring(f, a + FX.shrink, 1, 0.3));
  const lab = 1 - interpolate(p, [0, 0.25], [0, 1], clamp);
  const pause = interpolate(l, [FX.pause, FX.pause + 10], [0, 1], { ...clamp, easing: io });
  const live = interpolate(l, [FX.moveEnd, FX.shrink], [0, 1], clamp);
  // geometry worked out from the start of the scene: morph (eased), then one spring into tile 01
  const s = aspring(f, a + FX.shrink, 1, 0.5), t0 = tile(0);
  const W0 = 300 + 566 * p, H0 = 96 + 504 * p, cx0 = 540, cy0 = 805;
  const W = W0 + (T - W0) * s, H = H0 + (T - H0) * s, cx = cx0 + (t0.x + T / 2 - cx0) * s, cy = cy0 + (t0.y + T / 2 - cy0) * s;
  const R = (48 - 16 * p) + (36 - (48 - 16 * p)) * s;
  const num = aspring(f, a + FX.shrink + 8, 1, 0.35);
  const card = { background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.06), 0 18px 50px rgba(0,0,0,.08)" };
  const Num = ({ i, o }) => (
    <div style={{ position: "absolute", left: 24, top: 20, ...type(44), fontWeight: 600, color: INK, opacity: o }}>
      {String(i + 1).padStart(2, "0")}
      <div style={{ width: 14, height: 14, borderRadius: 7, background: GROUP[Math.floor(i / 4)], marginTop: 70 }} />
    </div>
  );
  return (
    <AbsoluteFill>
      {Array.from({ length: 15 }, (_, k) => {
        const i = k + 1, q = aspring(f, a + FX.tiles + k * FX.tileGap, 1, 0.45), { x, y } = tile(i);
        return q > 0.001 && (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: T, height: T, borderRadius: 36, ...card, opacity: q, transform: `translateY(${(1 - q) * 40}px) scale(${0.92 + 0.08 * q})` }}>
            <Num i={i} o={1} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: cx - W / 2, top: cy - H / 2, width: W, height: H, borderRadius: R, overflow: "hidden", ...card,
        boxShadow: `0 1px 2px rgba(0,0,0,.06), 0 ${18 + 22 * p * (1 - s)}px ${50 + 50 * p * (1 - s)}px rgba(0,0,0,${0.08 + 0.06 * p * (1 - s)})` }}>
        <div style={{ position: "absolute", inset: 0, opacity: body, background: `linear-gradient(135deg, ${BLUE}22, ${BLUE}66)` }} />
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, opacity: body }}>
          <div style={{ ...type(44), color: INK, marginBottom: 24 }}>Effect 01</div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,.1)" }}><div style={{ height: 6, width: `${8 + 70 * live}%`, borderRadius: 3, background: BLUE }} /></div>
        </div>
        <div style={{ position: "absolute", left: 30 + (W / 2 - 66) * p * (1 - s), top: H / 2 - 36 - 60 * body, width: 72, height: 72, borderRadius: 36,
          background: `rgba(29,29,31,${0.85 * body})`, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - s }}>
          <svg width={30} height={30} viewBox="0 0 26 26"><path fill={body > 0.5 ? "#fff" : INK} d={playPause(pause)} /></svg>
        </div>
        <div style={{ position: "absolute", left: 108, top: 0, height: 96, display: "flex", alignItems: "center", ...type(38), fontWeight: 600, color: INK, opacity: lab }}>Preview</div>
        <Num i={0} o={num} />
      </div>
      <Caption f={f} at={a + FX.tiles + 10} text="16 motion effects." tintWords={1} color={INK} tint="rgba(29,29,31,.4)" size={68} top={CAP} />
    </AbsoluteFill>
  );
}

// ── 5. springs, not tweens ────────────────────────────────────────────────────────────────────────
function Springs({ f }) {
  const a = S.spring, enter = aspring(f, a, 1, 0.5);
  const CW = 960, CH = 680, X0 = 70, Y0 = 560, PW = 820, PH = 380;   // plot area inside the card
  const N = 60, draw = interpolate(f, [a + 12, a + 62], [0, 1], clamp);
  const sp = (t) => 1 - (1 + (4 * Math.PI / 0.5) * t / 2) * Math.exp(-(4 * Math.PI / 0.5) * t / 2); // ratio 1, response 0.5
  const pts = (fn) => Array.from({ length: N + 1 }, (_, i) => { const t = (i / N) * 1.2; return `${X0 + (i / N) * PW},${Y0 - fn(t) * PH}`; }).join(" L");
  const dotT = draw * 1.2;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: (1080 - CW) / 2, top: 465, width: CW, height: CH, borderRadius: 40, background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.06), 0 30px 80px rgba(0,0,0,.08)", opacity: enter, transform: `scale(${0.96 + 0.04 * enter})` }}>
        <svg width={CW} height={CH} style={{ position: "absolute" }}>
          <line x1={X0} y1={Y0} x2={X0 + PW} y2={Y0} stroke="rgba(0,0,0,.08)" strokeWidth={2} />
          <line x1={X0} y1={Y0 - PH} x2={X0 + PW} y2={Y0 - PH} stroke="rgba(0,0,0,.08)" strokeWidth={2} strokeDasharray="6 8" />
          <path d={`M${pts((t) => Math.min(1, t / 1.2))}`} fill="none" stroke="rgba(29,29,31,.25)" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <path d={`M${pts(sp)}`} fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <circle cx={X0 + (dotT / 1.2) * PW} cy={Y0 - sp(dotT) * PH} r={14} fill={BLUE} opacity={draw > 0 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", left: X0, top: 56, display: "flex", gap: 36, ...type(34) }}>
          <span style={{ color: BLUE, fontWeight: 600 }}>● Spring, ratio 1.0</span>
          <span style={{ color: "rgba(29,29,31,.4)" }}>● Linear tween</span>
        </div>
        <div style={{ position: "absolute", left: X0, bottom: 34, ...type(34), fontFamily: "'Inter', monospace", color: "rgba(29,29,31,.55)", opacity: aspring(f, a + 50, 1, 0.5) }}>
          stiffness = (2π / response)²
        </div>
      </div>
      <Caption f={f} at={a + 20} text="Springs, not tweens." tintWords={2} color={INK} tint="rgba(29,29,31,.4)" size={68} top={CAP} />
    </AbsoluteFill>
  );
}

// ── 6. the 8-part brief ───────────────────────────────────────────────────────────────────────────
const PARTS = ["The bar", "Format", "The one rule", "Look", "Motion", "Never", "Before you finish", "The scene"];
function Brief({ f }) {
  const a = S.brief, enter = aspring(f, a, 1, 0.5);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, top: 400, width: 960, padding: "36px 48px", boxSizing: "border-box", borderRadius: 40, background: "rgba(255,255,255,.75)",
        borderTop: "1px solid rgba(255,255,255,.9)", boxShadow: "0 1px 2px rgba(0,0,0,.06), 0 30px 80px rgba(0,0,0,.08)", opacity: enter, transform: `scale(${0.96 + 0.04 * enter})` }}>
        {PARTS.map((t, i) => {
          const q = aspring(f, a + BRIEF.first + i * BRIEF.gap, 1, 0.4);
          const tick = interpolate(f, [a + BRIEF.first + i * BRIEF.gap + 4, a + BRIEF.first + i * BRIEF.gap + 14], [0, 1], { ...clamp, easing: io });
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 26, height: 92, opacity: q, transform: `translateY(${(1 - q) * 24}px)`,
              borderBottom: i < 7 ? "1px solid rgba(0,0,0,.06)" : "none" }}>
              <span style={{ ...type(34), fontWeight: 600, color: "rgba(29,29,31,.35)", width: 40 }}>{i + 1}</span>
              <span style={{ ...type(48), color: INK, flex: 1 }}>{t}</span>
              <svg width={40} height={40} viewBox="0 0 40 40"><circle cx={20} cy={20} r={18} fill={GREEN} opacity={tick} />
                <path d="M12 20.5 L18 26 L28 14" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /></svg>
            </div>
          );
        })}
      </div>
      <Caption f={f} at={a + 24} text="An 8-part brief, first." tintWords={1} color={INK} tint="rgba(29,29,31,.4)" size={68} top={CAP} />
    </AbsoluteFill>
  );
}

// ── 7. checked before it ships: the contact sheet + the loop-seam number from verify.sh ──────────
const THUMBS = ["#000", "#2F6BFF", "#FF6A3D", PAPER, "#9B5CFF", PAPER, "#000", "#2F6BFF", PAPER, "#FF2D8F", PAPER, "#000"];
function Check({ f }) {
  const a = S.check, r = aspring(f, a + CHECK.readout, 1, 0.45);
  const TW = 300, TH = 169, TG = 18, X = (1080 - (3 * TW + 2 * TG)) / 2, Y = 360;
  return (
    <AbsoluteFill>
      {THUMBS.map((c, i) => {
        const q = aspring(f, a + CHECK.thumbs + i * CHECK.gap, 1, 0.4);
        return (
          <div key={i} style={{ position: "absolute", left: X + (i % 3) * (TW + TG), top: Y + Math.floor(i / 3) * (TH + TG), width: TW, height: TH, borderRadius: 14,
            background: c === PAPER || c === "#000" ? c : `radial-gradient(ellipse at 30% 90%, ${c}, #0B1E4A 80%)`, border: "1px solid rgba(255,255,255,.12)",
            opacity: q, transform: `scale(${0.9 + 0.1 * q})` }}>
            <div style={{ position: "absolute", left: "50%", top: 0, width: 40, height: 8, transform: "translateX(-50%)", background: "#000", borderRadius: "0 0 5px 5px", opacity: c === PAPER ? 0 : 1 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: X, top: 1120, width: 3 * TW + 2 * TG, height: 120, boxSizing: "border-box", borderRadius: 30, background: "rgba(30,30,36,.7)",
        borderTop: "1px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", padding: "0 36px", gap: 22, opacity: r, transform: `translateY(${(1 - r) * 20}px)` }}>
        <span style={{ ...type(34), color: "rgba(255,255,255,.6)", flex: 1 }}>Loop seam</span>
        <span style={{ ...type(44), fontWeight: 600, color: "#fff" }}>0.04 / 255</span>
        <svg width={44} height={44} viewBox="0 0 40 40"><circle cx={20} cy={20} r={18} fill={GREEN} />
          <path d="M12 20.5 L18 26 L28 14" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - aspring(f, a + CHECK.readout + 8, 1, 0.4)} /></svg>
      </div>
      <Caption f={f} at={a + 24} text="Checked before it ships." tintWords={2} tint="rgba(255,255,255,.5)" size={68} top={CAP} />
    </AbsoluteFill>
  );
}

// ── 8. end frame ──────────────────────────────────────────────────────────────────────────────────
function End({ f }) {
  const a = S.end, p1 = aspring(f, a + 6, 1, 0.6), p2 = aspring(f, a + 18, 1, 0.6), p3 = aspring(f, a + 34, 1, 0.6);
  const breathe = interpolate(f - a, [0, 120], [1, 1.02], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", textAlign: "center", transform: `scale(${breathe})` }}>
      <div style={{ position: "absolute", top: 700, width: "100%" }}>
        <div style={{ ...type(84), color: "#fff", opacity: p1, filter: `blur(${(1 - p1) * 8}px)` }}>/apple-motion-graphics</div>
        <div style={{ ...type(44), color: "rgba(255,255,255,.55)", marginTop: 22, opacity: p2, transform: `translateY(${(1 - p2) * 14}px)` }}>A Claude Code skill.</div>
      </div>
      <div style={{ position: "absolute", top: 1150, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: p3 }}>
        <svg viewBox={WORDMARK.viewBox} width={280} height={280 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={YELLOW} /></svg>
        <div style={{ ...type(26), color: "rgba(255,255,255,.35)" }}>Not affiliated with Apple.</div>
      </div>
    </AbsoluteFill>
  );
}

export function Main({ sound }) {
  useFonts(fonts);
  const f = useCurrentFrame();
  const light = interpolate(f, [S.fx - 6, S.fx + 8, S.check - 8, S.check + 4], [0, 1, 1, 0], { ...clamp, easing: io });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ background: PAPER, opacity: light }} />
      <Scene f={f} a={S.hello} b={S.title}><HelloScene f={f} /></Scene>
      <Scene f={f} a={S.title} b={S.film}><Title f={f} /></Scene>
      <Scene f={f} a={S.film} b={S.fx}><FilmScene f={f} /></Scene>
      <Scene f={f} a={S.fx} b={S.spring}><Effects f={f} /></Scene>
      <Scene f={f} a={S.spring} b={S.brief}><Springs f={f} /></Scene>
      <Scene f={f} a={S.brief} b={S.check}><Brief f={f} /></Scene>
      <Scene f={f} a={S.check} b={S.end}><Check f={f} /></Scene>
      <Scene f={f} a={S.end} b={99999}><End f={f} /></Scene>
      {sound && <Audio src={staticFile("sound.wav")} />}
    </AbsoluteFill>
  );
}
