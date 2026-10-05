import { AbsoluteFill, Audio, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, BEATS } from "./timing.js";
import { WORDMARK, sparkPath } from "./brand.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Streak, Grain, Vignette } from "./fx.jsx";

const C = { ink: "#0A0913", ink2: "#1C1740", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF" };
// Sora 600 advance widths (em), measured from the font file, for exact letter placement.
const ADV = { I: 0.326, d: 0.699, e: 0.62, a: 0.588, s: 0.549, ",": 0.269, p: 0.699, i: 0.325, f: 0.381, ".": 0.269 };
const TRACK = -0.04;
const widthOf = (w) => [...w].reduce((s, c) => s + (ADV[c] ?? 0.6) + TRACK, 0) - TRACK;
const xs = (w, size, cx) => { let x = cx - (widthOf(w) * size) / 2; return [...w].map((c) => { const at = x; x += ((ADV[c] ?? 0.6) + TRACK) * size; return at; }); };

// icon tiles: background, letter colour inside the tile
const TILES = [[C.uv, C.paper], [C.sky, C.ink], [C.paper, C.ink], [C.ink2, C.iris], [C.uv, C.paper], [C.paper, C.ink], [C.sky, C.ink], [C.ink2, C.iris], [C.uv, C.paper]];
const ORDER = [4, 1, 5, 7, 3, 0, 2, 8, 6]; // burst order: centre first, then around

function Glyph({ ch, x, y, size, style }) {
  return <span style={{ position: "absolute", left: x, top: y - size * 0.56, fontFamily: "Display", fontWeight: 600, fontSize: size, lineHeight: 1, whiteSpace: "pre", ...style }}>{ch}</span>;
}

export const Main = ({ first, second }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const cx = width / 2, cy = height / 2;

  // beat pulse: 1 on every beat, decaying over the beat
  const lastBeat = BEATS.filter((b) => b <= f).pop() ?? 0;
  const pulse = Math.exp(-(f - lastBeat) / 4);

  // camera
  const [s1x, s1y] = shake(f, T.hit, 24, 4.5);
  const [s2x, s2y] = shake(f, T.solid, 9, 3);
  const punch = f >= T.solid && f < T.implode ? interpolate(f - T.solid, [0, 6], [1.07, 1], { ...clamp, easing: easeOut }) : 1;
  const push = interpolate(f, [T.end, 240], [1, 1.04], clamp);

  // background field: ink, ultraviolet on bar 2's downbeat beat
  const uvField = f >= T.solid && f < T.implode ? 1 : 0;
  const glow = interpolate(f, [0, T.silence - 2, T.silence, T.hit, T.hit + 25, 240], [0.35, 0.6, 0.05, 1, 0.55, 0.5], clamp);

  /* ── bar 1-2: "Ideas," ─────────────────────────────── */
  const bigSize = 300;
  const bigX = xs(first, bigSize, cx);
  const implodeP = (i) => interpolate(f, [T.implode + i * 1.5, T.implode + 11 + i * 1.5], [0, 1], { ...clamp, easing: easeIn });
  const showBig = f < T.spark;

  /* ── spark (the idea) ─────────────────────────────── */
  const sparkIn = spring({ frame: f - (T.spark - 3), fps, config: { damping: 8, stiffness: 160 } });
  const suck = interpolate(f, [T.silence, T.hit], [0, 1], { ...clamp, easing: easeIn });
  const charge = interpolate(f, [T.riserA, T.silence], [0, 1], clamp);
  const sparkR = 74 * sparkIn * (1 + charge * 0.35) * (1 - suck * 0.75);
  const sparkRot = (f - T.spark) * (2 + charge * 14);

  /* ── bar 3: icons -> word ─────────────────────────── */
  const tile = 250, gap = 36, gridW = tile * 3 + gap * 2;
  const gx = (i) => cx - gridW / 2 + (i % 3) * (tile + gap) + tile / 2;
  const gy = (i) => cy - gridW / 2 + Math.floor(i / 3) * (tile + gap) + tile / 2;
  const lineSize = 200, line1Y = cy - 120, line2Y = cy + 110;
  const lineX = xs(second, lineSize, cx);
  const collapse = spring({ frame: f - T.collapse, fps, config: { damping: 15, stiffness: 170 } });
  const tileSize = 168;

  /* ── final lockup ─────────────────────────────────── */
  const wm = interpolate(f, [T.end + 4, T.end + 20], [0, 1], { ...clamp, easing: easeOut });
  const wmW = 300, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  const sheenX = interpolate(f, [T.sheen, T.sheen + 26], [-0.3, 1.3], { ...clamp, easing: easeOut });

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      <AbsoluteFill style={{ background: C.uv, opacity: uvField }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(91,43,255,${0.5 * glow * (1 - uvField)}), transparent 58%)` }} />
      {/* beat-synced grid */}
      <AbsoluteFill style={{ opacity: (0.08 + pulse * 0.1) * (1 - uvField), backgroundImage: "linear-gradient(rgba(205,190,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(205,190,255,.5) 1px, transparent 1px)", backgroundSize: "90px 90px", backgroundPosition: `${cx}px ${cy}px`, maskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000, transparent 70%)`, WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000, transparent 70%)` }} />

      <AbsoluteFill style={{ transform: `translate(${s1x + s2x}px, ${s1y + s2y}px) scale(${punch * push})`, transformOrigin: `${cx}px ${cy}px` }}>
        {/* "Ideas," outlined on 8ths, solid on the downbeat, then implodes */}
        {showBig && [...first].map((ch, i) => {
          const s = spring({ frame: f - T.letters[i], fps, config: { damping: 12, stiffness: 220 } });
          const p = implodeP(i);
          const x = interpolate(p, [0, 1], [bigX[i], cx - 40]);
          const solid = f >= T.solid;
          return (
            <Glyph key={i} ch={ch} x={x} y={cy + (1 - s) * -260} size={bigSize} style={{
              opacity: f < T.letters[i] ? 0 : 1 - p * 0.6,
              transform: `rotate(${(1 - s) * (i % 2 ? 14 : -14)}deg) scale(${1 - p})`, transformOrigin: "50% 56%",
              color: solid ? C.paper : "transparent", WebkitTextStroke: solid ? "0px" : `3px ${C.paper}`,
              letterSpacing: `${TRACK}em`, filter: `blur(${p * 6}px)`,
            }} />
          );
        })}

        {/* the spark */}
        {f >= T.spark - 3 && f < T.hit && (
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <defs><radialGradient id="sparkGlow"><stop offset="0" stopColor={C.iris} stopOpacity=".55" /><stop offset="1" stopColor={C.iris} stopOpacity="0" /></radialGradient></defs>
            <circle cx={cx} cy={cy} r={sparkR * (3 + charge * 2.5)} fill="url(#sparkGlow)" opacity={1 - suck} />
            {[1.6, 2.4].map((k, j) => <circle key={j} cx={cx} cy={cy} r={sparkR * k * (1 + charge)} fill="none" stroke={C.iris} strokeOpacity={0.4 * charge * (1 - suck)} strokeWidth="2" strokeDasharray="4 10" transform={`rotate(${f * (j ? -4 : 6)} ${cx} ${cy})`} />)}
            <path d={sparkPath(cx, cy, Math.max(0.1, sparkR), 0.2)} fill={C.paper} transform={`rotate(${sparkRot} ${cx} ${cy})`} />
          </svg>
        )}

        {/* icons burst onto the grid, flip to letters, snap into the word */}
        {f >= T.hit && [...second].map((ch, i) => {
          const k = ORDER.indexOf(i);
          const out = spring({ frame: f - T.hit - k, fps, config: { damping: 12, stiffness: 190 } });
          const flipT = f - T.flip - k * 0.8;
          const flip = flipT < 0 ? 0 : Math.min(1, flipT / 8); // 0 front (icon) -> 1 back (letter)
          const scaleX = Math.abs(Math.cos(flip * Math.PI));
          const showLetter = flip >= 0.5;
          const tx = interpolate(out, [0, 1], [cx, gx(i)]);
          const ty = interpolate(out, [0, 1], [cy, gy(i)]);
          // grid -> line
          const p = collapse;
          const lx = lineX[i] + (ADV[ch] * lineSize) / 2;
          const x = interpolate(p, [0, 1], [tx, lx]);
          const y = interpolate(p, [0, 1], [ty, line2Y]);
          const [bg, fg] = TILES[i];
          const tileScale = interpolate(p, [0, 0.6], [1, 0], clamp);
          const gsize = interpolate(p, [0, 1], [tileSize, lineSize]);
          const color = interpolateColors(p, [0, 1], [fg, C.iris]);
          const rot = (1 - out) * (k % 2 ? 30 : -30);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
              <div style={{ position: "absolute", left: -tile / 2, top: -tile / 2, width: tile, height: tile, transform: `rotate(${rot}deg) scale(${out * tileScale}) scaleX(${scaleX})`, borderRadius: 64, background: bg, boxShadow: "0 24px 50px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.18)" }}>
                {!showLetter && <svg viewBox="-60 -60 120 120" width={tile} height={tile} style={{ position: "absolute", inset: 0, opacity: 0.85 }}><path d={sparkPath(0, 0, 26, 0.2)} fill={fg} /></svg>}
              </div>
              {showLetter && (
                <Glyph ch={ch} x={-(ADV[ch] * gsize) / 2} y={0} size={gsize} style={{ color, transform: `scaleX(${p > 0.01 ? 1 : scaleX})`, letterSpacing: 0 }} />
              )}
            </div>
          );
        })}

        {/* "Ideas," returns above */}
        {f >= T.ideas && xs(first, lineSize, cx).map((x, i) => {
          const s = spring({ frame: f - T.ideas - i, fps, config: { damping: 13, stiffness: 220 } });
          return <Glyph key={i} ch={first[i]} x={x} y={line1Y - (1 - s) * 140} size={lineSize} style={{ color: C.paper, opacity: s, letterSpacing: `${TRACK}em` }} />;
        })}

        {/* sheen over the lockup */}
        {f >= T.sheen && f < T.sheen + 28 && (
          <div style={{ position: "absolute", left: 0, top: line1Y - 160, width, height: 420, background: `linear-gradient(105deg, transparent ${sheenX * 100 - 8}%, rgba(255,255,255,.22) ${sheenX * 100}%, transparent ${sheenX * 100 + 8}%)`, mixBlendMode: "screen" }} />
        )}

        {/* wordmark */}
        <svg viewBox={WORDMARK.viewBox} width={wmW} height={wmH} style={{ position: "absolute", left: cx - wmW / 2, top: line2Y + 230 + (1 - wm) * 30, opacity: wm }}>
          <path d={WORDMARK.letters} fill={C.paper} opacity=".9" /><path d={WORDMARK.spark} fill={C.iris} />
        </svg>

        <Shockwave f={f} cx={cx} cy={cy} start={T.hit} max={height * 0.75} width={10} />
        <Shockwave f={f} cx={cx} cy={cy} start={T.solid} max={width * 0.8} width={4} rgb="243,241,250" dur={20} />
        <Streak f={f} start={T.hit} y={cy} color={C.iris} />
        <Burst f={f} cx={cx} cy={cy} start={T.hit} count={110} speed={46} colors={["#fff", C.iris, C.sky]} seed="hit" />
        <Burst f={f} cx={cx} cy={cy} start={T.spark - 2} count={14} speed={12} colors={[C.paper, C.iris]} seed="spark" scale={0.7} />
      </AbsoluteFill>

      {/* beat counter, top safe zone */}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14 }}>
        {BEATS.map((b, i) => <span key={i} style={{ width: 26, height: 6, borderRadius: 4, background: f >= b ? (i === BEATS.indexOf(lastBeat) ? C.paper : C.iris) : "rgba(205,190,255,.18)", opacity: f >= T.end + 10 ? interpolate(f, [T.end + 10, T.end + 24], [1, 0], clamp) : 1 }} />)}
      </div>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontFamily: "Mono", fontSize: 22, letterSpacing: "0.24em", color: "rgba(243,241,250,.55)", opacity: f >= T.end + 10 ? interpolate(f, [T.end + 10, T.end + 24], [1, 0], clamp) : 1 }}>
        120 BPM · BEAT {String(BEATS.indexOf(lastBeat) + 1).padStart(2, "0")}/16
      </div>

      <Flash f={f} start={T.hit} />
      <Flash f={f} start={T.solid} peak={0.35} />
      <Vignette />
      <Grain f={f} />
    </AbsoluteFill>
  );
};
