// "An idea becomes an app": a spark falls onto a home screen, becomes the Appify icon,
// shatters into the mark, and the mark unfolds into the wordmark.
import { AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "./timing.js";
import { MARK, WORDMARK, WSPARK, sparkPath } from "./brand.js";
import { LETTERS } from "./letters.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Streak, Grain, Vignette } from "./fx.jsx";

const C = { ink: "#0A0913", ink2: "#17142B", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF" };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = Easing.inOut(Easing.cubic);
const WM_W = WORDMARK.width, WM_CY = -267; // x-height centre
const MCX = 226, MCY = 300;                // centre of the mark's "a" (ring + stem)

function TileGlyph({ k, size }) {
  const kind = Math.floor(random(`g${k}`) * 4), col = [C.iris, C.sky, C.paper, C.uv][Math.floor(random(`c${k}`) * 4)];
  const s = size * 0.34;
  if (kind === 0) return <circle cx="0" cy="0" r={s * 0.5} fill={col} opacity=".35" />;
  if (kind === 1) return <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.25} fill={col} opacity=".3" />;
  if (kind === 2) return <path d={`M${-s / 2},${s / 3} L0,${-s / 2} L${s / 2},${s / 3} Z`} fill={col} opacity=".3" />;
  return <g opacity=".3"><rect x={-s / 2} y={-s / 3} width={s} height={s * 0.18} rx="4" fill={col} /><rect x={-s / 2} y={0} width={s * 0.7} height={s * 0.18} rx="4" fill={col} /></g>;
}

export const Main = ({ slogan, url, tags = [] }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const cx = W / 2, cy = H * (H > 1600 ? 0.45 : 0.43);

  // ── wordmark layout ──
  const s = Math.min(W * 0.72, 780) / WM_W;
  const X = (u) => cx + (u - WM_W / 2) * s, Y = (v) => cy + (v - WM_CY) * s;

  // ── home-screen grid ──
  const cols = 5, rows = H > 1600 ? 7 : 5, tS = 132, gap = 36;
  const gw = cols * tS + (cols - 1) * gap, gh = rows * tS + (rows - 1) * gap;
  const midR = Math.floor(rows / 2), midC = 2;
  const tiles = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = cx - gw / 2 + c * (tS + gap) + tS / 2, y = cy - gh / 2 + r * (tS + gap) + tS / 2;
    tiles.push({ x, y, d: Math.hypot(r - midR, c - midC), mid: r === midR && c === midC, k: r * cols + c });
  }

  // ── the falling spark (the idea) ──
  const sparkPos = (t) => {
    const p = interpolate(t, [T.fallA, T.land], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    return [cx + Math.sin(t / 4) * 26 * (1 - p), lerp(H * 0.12, cy, p)];
  };
  const ignite = spring({ frame: f - T.ignite, fps, config: { damping: 9, stiffness: 160 } });
  const [spx, spy] = sparkPos(f);

  // ── centre tile: grow, flip, shatter ──
  const grow = spring({ frame: f - (T.clearA + 2), fps, config: { damping: 14, stiffness: 140 } });
  const big = 400;
  const tileSize = f < T.land ? tS : lerp(tS, big, grow);
  const flip = interpolate(f, [T.flipA, T.flipB], [0, 180], { ...clamp, easing: ease });
  const squeeze = interpolate(f, [T.hush, T.hit - 1], [1, 0.94], { ...clamp, easing: easeIn });
  const landSquash = f >= T.land ? spring({ frame: f - T.land, fps, config: { damping: 8, stiffness: 260 } }) : 0;

  // ── the mark (after the hit) ──
  const heroScale = 290 / 224;
  const slam = interpolate(spring({ frame: f - T.hit, fps, config: { damping: 11, stiffness: 210 } }), [0, 1], [1.28, 1]);
  const morph = interpolate(f, [T.morphA, T.morphB - 3], [0, 1], { ...clamp, easing: ease });
  const aL = LETTERS[0];
  const mx = lerp(cx, X((aL.x0 + aL.x1) / 2), morph), my = lerp(cy, Y(WM_CY), morph);
  const ms = lerp(heroScale * slam, (534 * s) / 224, morph);
  const markFade = f < T.morphB - 3 ? 1 : 0;
  const ca = f >= T.hit ? 14 * Math.exp(-(f - T.hit) / 4) : 0;

  // spark: rides with the mark, then flies to the i
  const markSpark = [mx + (MARK.sparkX - MCX) * ms, my + (MARK.sparkY - MCY) * ms];
  const iDot = [X(WSPARK.x), Y(WSPARK.y)];
  const fly = interpolate(f, [T.sparkA, T.sparkLand], [0, 1], { ...clamp, easing: ease });
  const flyX = lerp(markSpark[0], iDot[0], fly), flyY = lerp(markSpark[1], iDot[1], fly) - Math.sin(fly * Math.PI) * 140;
  const flyR = lerp(MARK.sparkR * ms, WSPARK.r * s, fly);
  const landS = spring({ frame: f - T.sparkLand, fps, config: { damping: 7, stiffness: 220 } });

  // camera
  const [s1x, s1y] = shake(f, T.hit, 22, 4.5);
  const [s2x, s2y] = shake(f, T.sparkLand, 5, 3);
  const [s3x, s3y] = shake(f, T.land, 6, 3);
  const push = interpolate(f, [T.sparkLand, 240], [1, 1.035], clamp);
  const glow = interpolate(f, [0, T.land, T.hush, T.hit - 1, T.hit, T.hit + 30, 240], [0.15, 0.45, 0.6, 0.12, 1, 0.55, 0.5], clamp) + (f > T.hit + 30 ? 0.05 * Math.sin(f / 18) : 0);

  const sheenX = interpolate(f, [T.sheen, T.sheen + 30], [-600, WM_W + 600], { ...clamp, easing: ease });
  const vb = `0 ${WORDMARK.top} ${WM_W} ${WORDMARK.bottom - WORDMARK.top}`;
  const wmBox = { position: "absolute", left: X(0), top: Y(WORDMARK.top), width: WM_W * s, height: (WORDMARK.bottom - WORDMARK.top) * s };
  const sloganWords = slogan.split(" ");
  const tagY = Y(WORDMARK.bottom) + 40;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(91,43,255,${0.5 * glow}) 0%, rgba(91,43,255,${0.16 * glow}) 30%, transparent 62%)` }} />
      <AbsoluteFill style={{ transform: `translate(${s1x + s2x + s3x}px, ${s1y + s2y + s3y}px) scale(${push})`, transformOrigin: `${cx}px ${cy}px` }}>

        {/* home screen of ghost apps */}
        {f < T.hit && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {tiles.filter((t) => !t.mid).map((t) => {
              const appear = interpolate(f, [8 + t.d * 2, 22 + t.d * 2], [0, 1], { ...clamp, easing: easeOut });
              const near = f < T.land ? Math.exp(-Math.hypot(t.x - spx, t.y - spy) / 130) : 0;
              const rip = f >= T.land ? Math.sin(Math.PI * interpolate(f - T.land - t.d * 2.5, [0, 9], [0, 1], clamp)) * 0.2 : 0;
              const away = interpolate(f, [T.clearA + t.d * 2, T.clearA + 12 + t.d * 2], [0, 1], { ...clamp, easing: easeIn });
              const sc = (1 + rip) * (1 - away * 0.5);
              return (
                <g key={t.k} transform={`translate(${t.x} ${t.y + away * 90}) scale(${sc})`} opacity={appear * (1 - away)}>
                  <rect x={-tS / 2} y={-tS / 2} width={tS} height={tS} rx="34" fill={`rgba(205,190,255,${0.05 + near * 0.25})`} stroke={`rgba(205,190,255,${0.14 + near * 0.4})`} strokeWidth="2" />
                  <TileGlyph k={t.k} size={tS} />
                </g>
              );
            })}
            {/* empty centre slot before the spark lands */}
            {f < T.land && <rect x={cx - tS / 2} y={cy - tS / 2} width={tS} height={tS} rx="34" fill="none" stroke="rgba(205,190,255,.35)" strokeWidth="3" strokeDasharray="8 10" opacity={interpolate(f, [8, 20], [0, 1], clamp)} />}
          </svg>
        )}

        {/* the falling spark with a trail */}
        {f >= T.ignite && f < T.land && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {[6, 5, 4, 3, 2, 1].map((k) => { const [tx, ty] = sparkPos(f - k * 1.5); return f - k * 1.5 > T.fallA ? <circle key={k} cx={tx} cy={ty} r={14 - k * 1.6} fill={C.iris} opacity={0.5 - k * 0.07} /> : null; })}
            <defs><radialGradient id="sg0"><stop offset="0" stopColor={C.iris} stopOpacity=".55" /><stop offset="1" stopColor={C.iris} stopOpacity="0" /></radialGradient></defs><circle cx={spx} cy={spy} r={90 * ignite} fill="url(#sg0)" />
            <path d={sparkPath(spx, spy, 30 * ignite, 0.2)} fill={C.paper} transform={`rotate(${(f - T.ignite) * 3} ${spx} ${spy})`} />
          </svg>
        )}

        {/* centre tile: app icon that flips into the Appify icon */}
        {f >= T.land && f < T.hit && (
          <div style={{ position: "absolute", left: cx - tileSize / 2, top: cy - tileSize / 2, width: tileSize, height: tileSize, perspective: 1400, transform: `scale(${squeeze * (1 + (1 - landSquash) * 0.12)}, ${squeeze * (1 - (1 - landSquash) * 0.12)})` }}>
            <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateY(${flip}deg)` }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: tileSize * 0.26, background: `linear-gradient(140deg, ${C.iris}, ${C.uv} 60%, #3A1BB0)`, backfaceVisibility: "hidden", boxShadow: `0 30px 80px rgba(91,43,255,.55), inset 0 2px 0 rgba(255,255,255,.3)`, display: "grid", placeItems: "center" }}>
                <svg width={tileSize * 0.5} height={tileSize * 0.5} viewBox="-50 -50 100 100"><path d={sparkPath(0, 0, 40, 0.2)} fill="#fff" /></svg>
              </div>
              <div style={{ position: "absolute", inset: 0, borderRadius: tileSize * 0.26, background: `radial-gradient(circle at 70% 20%, #2A1C63, ${C.ink2} 60%, #07060F)`, backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 30px 80px rgba(91,43,255,.55), inset 0 0 0 2px rgba(205,190,255,.18)", display: "grid", placeItems: "center" }}>
                <svg viewBox={MARK.viewBox} height={tileSize * 0.68}><path d={`${MARK.ring} ${MARK.stem}`} fill={C.paper} /><path d={MARK.spark} fill={C.iris} /></svg>
              </div>
            </div>
          </div>
        )}

        {/* shattered tile fragments */}
        {f >= T.hit && f < T.hit + 40 && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const t = f - T.hit, a = (i / 14) * Math.PI * 2 + random(`fa${i}`) * 0.4, v = 22 + random(`fv${i}`) * 18;
              const d = v * 9 * (1 - Math.exp(-t / 9)), sz = 40 + random(`fs${i}`) * 50, o = 1 - t / 40;
              return <rect key={i} x={cx + Math.cos(a) * (120 + d) - sz / 2} y={cy + Math.sin(a) * (120 + d) - sz / 2 + 0.05 * t * t} width={sz} height={sz} rx={sz * 0.28} fill={i % 3 ? C.uv : C.ink2} stroke="rgba(205,190,255,.4)" strokeWidth="2" opacity={o} transform={`rotate(${t * (i % 2 ? 9 : -9)} ${cx + Math.cos(a) * (120 + d)} ${cy + Math.sin(a) * (120 + d)})`} />;
            })}
          </svg>
        )}

        {/* the mark */}
        {f >= T.hit && f < T.morphB + 2 && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: markFade }}>
            {(ca > 0.5 ? [["#FF2B4E", -ca], ["#2BFF8F", 0], ["#3B5BFF", ca]] : [[C.paper, 0]]).map(([col, dx]) => (
              <g key={col} transform={`translate(${mx + dx} ${my}) scale(${ms}) translate(${-MCX} ${-MCY})`} style={{ mixBlendMode: ca > 0.5 ? "screen" : "normal" }}>
                <path d={`${MARK.ring} ${MARK.stem}`} fill={col} />
              </g>
            ))}
          </svg>
        )}

        {/* wordmark letters: "a" crossfades in, p-p-i-f-y pop out of little app tiles */}
        {f >= T.lettersA - 1 && (
          <div style={wmBox}>
            <svg viewBox={vb} width="100%" height="100%" style={{ overflow: "visible" }}>
              <defs><clipPath id="letters">{LETTERS.map((L, i) => <path key={i} d={L.d} />)}</clipPath>
                <linearGradient id="sheen" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
              {LETTERS.map((L, i) => {
                const start = i === 0 ? T.morphB - 3 : T.lettersA + (i - 1) * 4;
                if (f < start || (i === 0 && f < T.morphB - 3)) return null;
                const pcx = (L.x0 + L.x1) / 2, pcy = WM_CY;
                if (i === 0) { const a0 = spring({ frame: f - start, fps, config: { damping: 9, stiffness: 260 } }); return <g key={i} transform={`translate(${pcx} ${pcy}) scale(${0.9 + 0.1 * a0}) translate(${-pcx} ${-pcy})`}><path d={L.d} fill={C.paper} /></g>; }
                const p = spring({ frame: f - start, fps, config: { damping: 10, stiffness: 220 } });
                const tileP = interpolate(f - start, [0, 3, 9], [0, 1, 0], clamp);
                const ts = 700;
                return (
                  <g key={i}>
                    <rect x={pcx - ts / 2} y={pcy - ts / 2} width={ts} height={ts} rx={ts * 0.26} fill={C.uv} opacity={tileP} transform={`translate(${pcx} ${pcy}) scale(${0.4 + tileP * 0.6}) translate(${-pcx} ${-pcy})`} />
                    <g transform={`translate(${pcx} ${pcy}) scale(${p}) translate(${-pcx} ${-pcy})`}><path d={L.d} fill={C.paper} /></g>
                  </g>
                );
              })}
              {f >= T.sheen && f < T.sheen + 32 && <g clipPath="url(#letters)"><rect x={sheenX - 240} y={WORDMARK.top - 300} width="480" height={WORDMARK.bottom - WORDMARK.top + 600} fill="url(#sheen)" opacity=".5" transform="skewX(-18)" /></g>}
            </svg>
          </div>
        )}

        {/* the spark: on the mark, flying, then the i-dot */}
        {f >= T.hit && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {(() => {
              const x = f < T.sparkA ? markSpark[0] : flyX, y = f < T.sparkA ? markSpark[1] : flyY;
              const r = f < T.sparkA ? MARK.sparkR * ms : flyR;
              const sq = f >= T.sparkLand ? interpolate(landS, [0, 1], [0.55, 1]) : 1, sx = f >= T.sparkLand ? interpolate(landS, [0, 1], [1.45, 1]) : 1;
              const rot = f < T.sparkA ? 0 : f < T.sparkLand ? fly * 360 : Math.sin((f - T.sparkLand) / 20) * 5;
              return (
                <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sx} ${sq})`}>
                  <defs><radialGradient id="sg1"><stop offset="0" stopColor={C.iris} stopOpacity=".6" /><stop offset="1" stopColor={C.iris} stopOpacity="0" /></radialGradient></defs><circle r={r * 3} fill="url(#sg1)" opacity={f >= T.sparkLand ? 0.6 : 0.9} />
                  <path d={sparkPath(0, 0, r, 0.2)} fill={C.iris} />
                </g>
              );
            })()}
          </svg>
        )}

        {/* slogan + url */}
        {f >= T.tagA && (
          <div style={{ position: "absolute", left: 0, right: 0, top: tagY, display: "grid", justifyItems: "center", gap: 26 }}>
            <div style={{ display: "flex", gap: "0.28em", fontFamily: "Display", fontWeight: 600, fontSize: 60, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              {sloganWords.map((w, i) => {
                const p = interpolate(f, [T.tagA + i * 5, T.tagA + 16 + i * 5], [0, 1], { ...clamp, easing: easeOut });
                return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 6 }}><span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, color: i === sloganWords.length - 1 ? C.iris : C.paper }}>{w}</span></span>;
              })}
            </div>
            <div style={{ width: 300 * interpolate(f, [T.urlA - 6, T.urlA + 10], [0, 1], { ...clamp, easing: easeOut }), height: 2, background: `linear-gradient(90deg, transparent, ${C.iris}, transparent)` }} />
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 30, letterSpacing: "0.2em", color: C.paper, opacity: 0.85 }}>
              {url.split("").map((ch, i) => { const p = interpolate(f, [T.urlA + i * 1.1, T.urlA + 12 + i * 1.1], [0, 1], { ...clamp, easing: easeOut }); return <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 6}px)`, color: ch === "." ? C.iris : C.paper }}>{ch}</span>; })}
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 14, maxWidth: W - 140 }}>
                {tags.map((t, i) => {
                  const p = spring({ frame: f - T.tagsA - i * 3, fps, config: { damping: 12, stiffness: 200 } });
                  return <span key={t} style={{ display: "inline-flex", alignItems: "center", height: 52, padding: "0 24px", borderRadius: 99, border: "1.5px solid rgba(205,190,255,.3)", background: "rgba(143,114,255,.1)", fontFamily: "Mono", fontSize: 21, letterSpacing: "0.12em", textTransform: "uppercase", color: C.paper, opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 18}px) scale(${0.85 + 0.15 * p})` }}>{t}</span>;
                })}
              </div>
            )}
          </div>
        )}

        <Shockwave f={f} cx={cx} cy={cy} start={T.land} max={W * 0.6} width={4} rgb="143,114,255" dur={24} />
        <Shockwave f={f} cx={cx} cy={cy} start={T.hit} max={Math.max(W, H) * 0.9} width={10} />
        <Streak f={f} start={T.hit} y={cy} color={C.iris} />
        <Burst f={f} cx={cx} cy={cy} start={T.hit} count={110} speed={44} colors={["#fff", C.iris, C.sky]} seed="hit" />
        <Shockwave f={f} cx={iDot[0]} cy={iDot[1]} start={T.sparkLand} max={200} width={4} rgb="143,114,255" dur={22} />
        <Shockwave f={f} cx={X((aL.x0 + aL.x1) / 2)} cy={Y(WM_CY)} start={T.morphB - 3} max={260} width={3} rgb="205,190,255" dur={14} />
        <Burst f={f} cx={iDot[0]} cy={iDot[1]} start={T.sparkLand} count={16} speed={11} colors={[C.paper, C.iris]} seed="dot" scale={0.7} />
      </AbsoluteFill>
      <Flash f={f} start={T.hit} peak={0.45} />
      <Vignette />
      <Grain f={f} opacity={0.06} />
    </AbsoluteFill>
  );
};
