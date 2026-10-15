// Gemini 3.5 spec commercial (unofficial, not affiliated with Google). 9:16, ~24 s, voice-over led.
// One idea: the Gemini spark is the one doing the work. It types the job as the cursor, bursts into the mark, then hops
// through each scene doing what the voice says, twinkles as a star while you sleep, and returns as the mark.
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, VO, S, PROMPT } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, after, Grain, Vignette } from "./fx.jsx";

const C = { ink: "#08090E", panel: "#12141C", line: "#262A36", chalk: "#F3F4F8", mute: "#9AA0AE", blue: "#4796E3", violet: "#9177C7", rose: "#CA6673", green: "#3DDC97" };
const GRAD = `linear-gradient(90deg, ${C.blue}, ${C.violet}, ${C.rose})`;
const T = { fontFamily: "Sans", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.02 };
const UI = { fontFamily: "Sans", fontWeight: 500 };
const MONO = { fontFamily: "Mono" };
const sp = (f, at, damping = 13, stiffness = 200) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const sparkD = (R = 50, k = 0.08) => { const q = R * k; return `M0,${-R} C${q},${-q} ${q},${-q} ${R},0 C${q},${q} ${q},${q} 0,${R} C${-q},${q} ${-q},${q} ${-R},0 C${-q},${-q} ${-q},${-q} 0,${-R} Z`; };

function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}
// the Gemini spark: a four-point star in the blue-violet-rose gradient, with a soft glow
export function Spark({ x, y, size = 60, rot = 0, glow = 0.6, id = "s", opacity = 1 }) {
  return (
    <svg width={size * 3} height={size * 3} viewBox="-150 -150 300 300" style={{ position: "absolute", left: x - size * 1.5, top: y - size * 1.5, opacity, overflow: "visible", transform: `rotate(${rot}deg)` }}>
      <defs>
        <linearGradient id={`g${id}`} x1="-50" y1="-50" x2="50" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={C.blue} /><stop offset=".55" stopColor={C.violet} /><stop offset="1" stopColor={C.rose} /></linearGradient>
        <filter id={`b${id}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      <path d={sparkD(50)} fill={`url(#g${id})`} filter={`url(#b${id})`} opacity={glow} transform="scale(1.25)" />
      <path d={sparkD(50)} fill={`url(#g${id})`} />
    </svg>
  );
}
// a line of type that rises out of a mask, word by word
function Rise({ f, at, text, style, stagger = 3 }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.26em", ...style }}>
      {text.split(" ").map((w, i) => {
        const p = after(f, at + i * stagger, [0, 14], [0, 1], { easing: easeOut });
        return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.1em" }}><span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{w}</span></span>;
      })}
    </span>
  );
}
function Super({ f, at, lines, top = 300, size = 92, color = C.chalk, out }) {
  const o = out ? interpolate(f, [out - 6, out], [1, 0], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top, textAlign: "center", ...T, fontSize: size, color, opacity: o }}>
      {lines.map((l, i) => <div key={i}><Rise f={f} at={at + i * 6} text={l} /></div>)}
    </div>
  );
}
function Bg({ f, night = 0 }) {
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "blur(90px)", opacity: 0.55 * (1 - night * 0.6) }}>
        <div style={{ position: "absolute", left: 80 + Math.sin(f / 60) * 80, top: 300 + Math.cos(f / 70) * 60, width: 700, height: 700, borderRadius: "50%", background: C.blue, opacity: 0.35 }} />
        <div style={{ position: "absolute", left: 420 + Math.cos(f / 55) * 70, top: 900 + Math.sin(f / 65) * 80, width: 640, height: 640, borderRadius: "50%", background: C.violet, opacity: 0.32 }} />
        <div style={{ position: "absolute", left: 220 + Math.sin(f / 50) * 60, top: 1400, width: 560, height: 560, borderRadius: "50%", background: C.rose, opacity: 0.22 }} />
      </AbsoluteFill>
      {night > 0 && <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,18,48,${night}), rgba(5,8,22,${night}))` }} />}
    </AbsoluteFill>
  );
}

// ── 1 · how it used to be: a small chat ─────────────────────────────────────────────────────────────
function Ask({ f }) {
  const a = VO.ask.at, out = interpolate(f, [S.hand - 2, S.hand + 8], [0, 1], { ...clamp, easing: easeIn });
  const blink = Math.floor(f / 12) % 2 === 0;
  const q = sp(f, a + 4, 14, 240), r = sp(f, a + 26, 14, 240);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `scale(${1 - out * 0.15})` }}>
      <Super f={f} at={a} lines={["You used to ask", "AI questions."]} top={330} size={96} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 820, display: "grid", gap: 26 }}>
        <div style={{ justifySelf: "end", ...UI, fontSize: 38, color: C.chalk, background: "#2A2E3B", padding: "22px 30px", borderRadius: "30px 30px 8px 30px", opacity: Math.min(1, q * 2), transform: `translateY(${(1 - q) * 30}px)` }}>What’s the capital of France?</div>
        <div style={{ justifySelf: "start", display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, r * 2), transform: `translateY(${(1 - r) * 30}px)` }}>
          <div style={{ position: "relative", width: 50, height: 50 }}><Spark x={25} y={25} size={22} id="av" glow={0.3} /></div>
          <div style={{ ...UI, fontSize: 38, color: C.chalk, background: C.panel, border: `2px solid ${C.line}`, padding: "22px 30px", borderRadius: "30px 30px 30px 8px" }}>Paris.</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1240, height: 96, borderRadius: 48, background: C.panel, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 34px", ...UI, fontSize: 32, color: C.mute }}>
        Ask anything<span style={{ marginLeft: 6, width: 3, height: 40, background: C.chalk, opacity: blink && f < a + 4 ? 1 : 0 }} />
      </div>
    </div>
  );
}

// ── 2 · now: the spark types the whole job, sends it, charges ────────────────────────────────────────
const CHIPS = [["Launch plan", 14, -240, -230], ["Website", 32, 250, -270], ["Venue", 50, -260, 250], ["Invites", 66, 240, 230]];
function Hand({ f }) {
  const t = f - S.hand, ty0 = 8, ty1 = S.send - S.hand - 4;
  const n = Math.round(interpolate(t, [ty0, ty1], [0, PROMPT.length], clamp));
  const sent = f >= S.send, charge = interpolate(f, [S.send, S.name], [0, 1], { ...clamp, easing: easeIn });
  const barIn = sp(t, 0, 14, 200);
  const exit = f >= S.send ? interpolate(f, [S.send, S.send + 10], [0, 1], { ...clamp, easing: easeIn }) : 0;
  // the spark: the cursor at the end of the typed text, then it lifts off to the centre and charges
  const cx = 540, cy = 980;
  const sx = sent ? interpolate(charge, [0, 0.3], [930, cx], { ...clamp, easing: easeOut }) : 930;
  const sy = sent ? interpolate(charge, [0, 0.3], [1080, cy - 100], { ...clamp, easing: easeOut }) : 1080;
  const size = sent ? 40 + charge * 150 + Math.sin(f * 1.3) * 8 * charge : 34 + Math.sin(f / 3) * 2;
  return (
    <>
      <Super f={f} at={VO.hand.at} lines={["Now you hand it", "the whole job."]} top={330} size={96} out={S.send + 8} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 860, minHeight: 300, borderRadius: 44, background: C.panel, border: "2px solid transparent", backgroundImage: `linear-gradient(${C.panel}, ${C.panel}), ${GRAD}`, backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box",
        padding: "40px 48px", ...UI, fontSize: 50, lineHeight: 1.3, color: C.chalk, opacity: Math.min(1, barIn * 2) * (1 - exit), transform: `translateY(${(1 - barIn) * 60 - exit * 40}px) scale(${1 - exit * 0.08})`, boxShadow: `0 0 ${80 * barIn}px rgba(145,119,199,.25)` }}>
        {PROMPT.slice(0, n)}
      </div>
      {CHIPS.map(([label, at, dx, dy], i) => {
        const p = sp(t, at, 12, 260), suck = charge > 0 ? interpolate(charge, [0.04, 0.35], [0, 1], { ...clamp, easing: easeIn }) : 0;
        const x = 540 + dx * (1 - suck) - 150, y = (dy < 0 ? 740 : 1300) + (dy < 0 ? -1 : 1) * (1 - p) * 40;
        const fy = suck ? y + (cy - 100 - y) * suck : y;
        return t >= at && suck < 1 && <div key={label} style={{ position: "absolute", left: x + (dx > 0 ? 0 : 0), top: fy - 40, width: 300, textAlign: "center", ...UI, fontSize: 32, color: C.chalk, padding: "18px 0", borderRadius: 999, background: "rgba(255,255,255,.06)", border: `2px solid ${[C.blue, C.violet, C.rose, C.blue][i]}`, opacity: Math.min(1, p * 2) * (1 - suck), transform: `scale(${(0.8 + 0.2 * p) * (1 - suck * 0.6)})` }}>{label}</div>;
      })}
      <Spark x={sx} y={sy} size={size} rot={charge * 90} glow={0.5 + charge * 0.5} id="cur" />
    </>
  );
}

// ── 3 · the burst: the Gemini mark and the name ──────────────────────────────────────────────────────
function Burst({ f, at, cx, cy }) {
  const t = f - at;
  if (t < 0 || t > 50) return null;
  return Array.from({ length: 70 }, (_, i) => {
    const a = random(`ba${i}`) * Math.PI * 2, v = 10 + random(`bv${i}`) * 26, d = v * 12 * (1 - Math.exp(-t / 12));
    const s = (4 + random(`bs${i}`) * 10) * (1 - t / 50);
    return <i key={i} style={{ position: "absolute", left: cx + Math.cos(a) * d, top: cy + Math.sin(a) * d, width: s, height: s, borderRadius: 9, background: [C.blue, C.violet, C.rose, "#fff"][i % 4], boxShadow: `0 0 12px ${[C.blue, C.violet, C.rose, "#fff"][i % 4]}` }} />;
  });
}
function Mark({ f, at, cx = 540, cy = 860, size = 170, label = true, sub = null, subAt = 0 }) {
  const p = sp(f, at, 10, 200), t = f - at;
  const ring = interpolate(t, [0, 24], [0, 1], { ...clamp, easing: easeOut });
  return (
    <>
      {t >= 0 && t < 24 && <div style={{ position: "absolute", left: cx - 600 * ring, top: cy - 600 * ring, width: 1200 * ring, height: 1200 * ring, borderRadius: "50%", border: `${10 * (1 - ring) + 1}px solid rgba(145,119,199,${1 - ring})` }} />}
      <Burst f={f} at={at} cx={cx} cy={cy} />
      <Spark x={cx} y={cy} size={size * interpolate(p, [0, 1], [0.3, 1]) * (1 + 0.02 * Math.sin(t / 12))} rot={(1 - p) * 120} glow={0.6 + 0.3 * Math.sin(t / 10)} id={`m${at}`} />
      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, top: cy + size * 1.25, textAlign: "center", ...T, fontWeight: 500, fontSize: 140, letterSpacing: "-0.04em", opacity: Math.min(1, after(f, at + 6, [0, 10], [0, 1]) * 1.5), transform: `translateY(${(1 - after(f, at + 6, [0, 14], [0, 1], { easing: easeOut })) * 40}px)` }}>
          <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Gemini 3.5</span>
        </div>
      )}
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: cy + size * 1.25 + 190, textAlign: "center", ...T, fontWeight: 500, fontSize: 64, color: C.chalk }}><Rise f={f} at={subAt} text={sub} /></div>}
    </>
  );
}

// ── 4 · what it does: one scene per verb, the spark is the one doing it ─────────────────────────────────
const Card = ({ children, style }) => <div style={{ position: "absolute", left: 90, right: 90, top: 640, height: 820, borderRadius: 44, background: C.panel, border: `2px solid ${C.line}`, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,.5)", ...style }}>{children}</div>;
function Verb({ f, k, children }) {
  const t = f - S[k], inP = sp(t, 0, 15, 220);
  const outAt = { plans: S.codes, codes: S.sees, sees: S.builds, builds: S.sleep }[k];
  const out = interpolate(f, [outAt - 2, outAt + 6], [0, 1], { ...clamp, easing: easeIn });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: (1 - out), transform: `translateX(${(1 - inP) * 120 - out * 160}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", ...T, fontSize: 150, color: C.chalk }}><Rise f={f} at={VO[k].at - 2} text={VO[k].text} stagger={2} /></div>
      {children(t)}
    </div>
  );
}
const TASKS = ["Launch timeline", "Budget split", "Guest list", "Venue shortlist", "Invite copy"];
function Plans({ f }) {
  return <Verb f={f} k="plans">{(t) => {
    const done = TASKS.map((_, i) => t >= 8 + i * 7);
    const cur = Math.min(TASKS.length - 1, Math.max(0, Math.floor((t - 4) / 7)));
    return (
      <Card>
        <div style={{ padding: "56px 60px", display: "grid", gap: 38 }}>
          <div style={{ ...MONO, fontSize: 26, color: C.mute, letterSpacing: "0.12em" }}>LAUNCH · PLAN</div>
          {TASKS.map((x, i) => (
            <div key={x} style={{ display: "flex", alignItems: "center", gap: 30, ...UI, fontSize: 46, color: done[i] ? C.chalk : C.mute }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, border: `3px solid ${done[i] ? C.green : C.line}`, background: done[i] ? "rgba(61,220,151,.15)" : "transparent", display: "grid", placeItems: "center", transform: `scale(${done[i] ? 1 + 0.25 * Math.exp(-(t - 8 - i * 7) / 3) : 1})` }}>
                {done[i] && <svg width="34" height="34" viewBox="0 0 34 34"><path d="M6 18 L14 26 L28 8" fill="none" stroke={C.green} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              {x}
            </div>
          ))}
        </div>
        <Spark x={58 + 28 + 60} y={56 + 26 + 38 + 28 + cur * 94 + 56 - 30} size={26} id="pl" />
      </Card>
    );
  }}</Verb>;
}
const CODE = [["const", " site = ", "build", "({"], ["  name:", " \"Launch Night\","], ["  pages:", " [hero, rsvp, map],"], ["  theme:", " \"midnight\","], ["});"], ["await", " deploy(site);"], ["await", " book(\"venue\", fri);"], ["send", "(invites, 120);"]];
function Codes({ f }) {
  return <Verb f={f} k="codes">{(t) => {
    const n = Math.min(CODE.length, Math.floor(Math.max(0, t - 4) / 3.2));
    const ok = t >= 34;
    return (
      <Card style={{ background: "#0C0E14" }}>
        <div style={{ display: "flex", gap: 10, padding: "28px 34px" }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 16, height: 16, borderRadius: 9, background: c }} />)}<span style={{ ...MONO, fontSize: 22, color: C.mute, marginLeft: 16 }}>launch.ts</span></div>
        <div style={{ padding: "10px 44px", ...MONO, fontSize: 36, lineHeight: 1.75 }}>
          {CODE.slice(0, n).map((ln, i) => (
            <div key={i}><span style={{ color: C.mute, marginRight: 26 }}>{String(i + 1).padStart(2, " ")}</span>{ln.map((s, j) => <span key={j} style={{ color: j === 0 ? C.violet : j === 2 ? C.blue : C.chalk }}>{s}</span>)}{i === n - 1 && !ok && <span style={{ display: "inline-block", width: 18, height: 36, marginLeft: 4, verticalAlign: "-6px", background: C.blue }} />}</div>
          ))}
        </div>
        {ok && <div style={{ position: "absolute", left: 44, right: 44, bottom: 44, padding: "24px 30px", borderRadius: 22, background: "rgba(61,220,151,.12)", border: `2px solid ${C.green}`, ...MONO, fontSize: 32, color: C.green, transform: `scale(${1 + 0.06 * Math.exp(-(t - 34) / 4)})` }}>✓ build passed · deployed</div>}
      </Card>
    );
  }}</Verb>;
}
// the sketch: a hand-drawn wireframe the spark reads, then builds
const SK = { header: [60, 70, 680, 90], hero: [60, 200, 680, 260], b1: [60, 500, 320, 90], b2: [420, 500, 320, 90], cards: [60, 630, 680, 130] };
const wob = (x, y, w, h, s) => { const r = (k) => (random(`${s}${k}`) - 0.5) * 8; return `M${x + r(1)},${y + r(2)} L${x + w + r(3)},${y + r(4)} L${x + w + r(5)},${y + h + r(6)} L${x + r(7)},${y + h + r(8)} Z`; };
function Sees({ f }) {
  return <Verb f={f} k="sees">{(t) => {
    const scan = interpolate(t, [4, 26], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const labels = [["header", "Header"], ["hero", "Hero image"], ["b1", "Button"], ["b2", "Button"], ["cards", "Cards"]];
    return (
      <Card style={{ background: "#F2EFE7" }}>
        <svg width="900" height="820" viewBox="0 0 800 820" style={{ position: "absolute", left: 0, top: 0 }}>
          {Object.entries(SK).map(([k, [x, y, w, h]]) => <path key={k} d={wob(x, y, w, h, k)} fill="none" stroke="#2B2B33" strokeWidth="5" strokeLinejoin="round" />)}
          <path d="M120,260 L320,420 M320,260 L120,420" stroke="#2B2B33" strokeWidth="4" />
          <path d="M100,108 h160 M560,108 h130" stroke="#2B2B33" strokeWidth="6" strokeLinecap="round" />
        </svg>
        {/* the scan */}
        {t >= 4 && t < 28 && <div style={{ position: "absolute", left: 0, right: 0, top: scan * 800, height: 6, background: GRAD, boxShadow: `0 0 40px ${C.violet}` }} />}
        {labels.map(([k, l], i) => {
          const [x, y, w, h] = SK[k], p = sp(t, 14 + i * 4, 12, 300), s = 900 / 800;
          return t >= 14 + i * 4 && <div key={k + i} style={{ position: "absolute", left: x * s - 8, top: y * s - 8, width: w * s + 16, height: h * s + 16, border: `4px solid ${[C.blue, C.violet, C.rose, C.rose, C.blue][i]}`, borderRadius: 14, opacity: Math.min(1, p * 2), transform: `scale(${interpolate(p, [0, 1], [1.12, 1])})` }}>
            <span style={{ position: "absolute", left: -4, top: -46, ...MONO, fontSize: 24, color: "#fff", background: [C.blue, C.violet, C.rose, C.rose, C.blue][i], padding: "6px 12px", borderRadius: 8 }}>{l}</span>
          </div>;
        })}
        <Spark x={interpolate(scan, [0, 1], [120, 780])} y={scan * 800} size={30} id="se" opacity={t < 30 ? 1 : 0} />
      </Card>
    );
  }}</Verb>;
}
function Builds({ f }) {
  return <Verb f={f} k="builds">{(t) => {
    const blk = (i) => sp(t, 4 + i * 5, 12, 280);
    const B = ({ i, style, children }) => { const p = blk(i); return <div style={{ position: "absolute", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 50}px) scale(${0.9 + 0.1 * p})`, ...style }}>{children}</div>; };
    const s = 900 / 800;
    return (
      <Card style={{ background: "#0D0F17" }}>
        <B i={0} style={{ left: 60 * s, top: 70 * s, width: 680 * s, height: 90 * s, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", ...UI, fontSize: 30, color: C.chalk }}><span style={{ fontWeight: 700 }}>Launch Night</span><span style={{ color: C.mute }}>RSVP · Map · FAQ</span></B>
        <B i={1} style={{ left: 60 * s, top: 200 * s, width: 680 * s, height: 260 * s, borderRadius: 26, background: `radial-gradient(circle at 30% 40%, ${C.violet}, transparent 60%), radial-gradient(circle at 75% 60%, ${C.blue}, transparent 60%), ${C.rose}55`, display: "grid", placeItems: "center", ...T, fontSize: 78, color: "#fff" }}>Friday, 8 PM</B>
        <B i={2} style={{ left: 60 * s, top: 500 * s, width: 320 * s, height: 90 * s, borderRadius: 999, background: "#fff", display: "grid", placeItems: "center", ...UI, fontWeight: 700, fontSize: 34, color: C.ink }}>RSVP</B>
        <B i={3} style={{ left: 420 * s, top: 500 * s, width: 320 * s, height: 90 * s, borderRadius: 999, border: "3px solid #fff", display: "grid", placeItems: "center", ...UI, fontSize: 34, color: "#fff" }}>Get directions</B>
        {[0, 1, 2].map((j) => <B key={j} i={4 + j} style={{ left: (60 + j * 233) * s, top: 630 * s, width: 214 * s, height: 130 * s, borderRadius: 20, background: "#1B1E2A", border: `2px solid ${C.line}` }} />)}
        <Spark x={interpolate(t, [4, 34], [180, 760], clamp)} y={interpolate(t, [4, 34], [120, 760], clamp)} size={26} id="bu" opacity={t < 38 ? 1 : 0} />
      </Card>
    );
  }}</Verb>;
}

// ── 5 · while you sleep: the spark is a star, the phone gets the results ─────────────────────────────────
const NOTES = [["Launch plan ready", "5 steps · shared with the team"], ["Your site is live", "launchnight.site"], ["Venue booked", "Friday, 8 PM"], ["120 invites sent", "34 RSVPs so far"]];
function Sleep({ f }) {
  const t = f - S.sleep, out = interpolate(f, [S.end - 4, S.end + 8], [0, 1], { ...clamp, easing: easeIn });
  const phone = sp(t, 6, 15, 160);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      {Array.from({ length: 70 }, (_, i) => <i key={i} style={{ position: "absolute", left: random(`sx${i}`) * 1080, top: random(`sy${i}`) * 1100, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: 9, background: "#fff", opacity: 0.25 + 0.5 * Math.abs(Math.sin(f / (9 + (i % 7)) + i)) }} />)}
      <Spark x={820} y={260} size={44 + 4 * Math.sin(f / 6)} id="st" glow={0.9} />
      <Super f={f} at={VO.sleep.at} lines={["And while you sleep…", "it keeps going."]} top={420} size={84} />
      <div style={{ position: "absolute", left: 190, top: 760 + (1 - phone) * 600, width: 700, height: 1300, borderRadius: 90, background: "#05070F", border: "6px solid #2A2E3B", boxShadow: "0 60px 140px rgba(0,0,0,.6)" }}>
        <div style={{ textAlign: "center", marginTop: 90, ...T, fontWeight: 500, fontSize: 150, color: "rgba(243,244,248,.9)" }}>3:14</div>
        <div style={{ textAlign: "center", ...UI, fontSize: 32, color: C.mute }}>Saturday</div>
        <div style={{ margin: "60px 34px 0", display: "grid", gap: 20 }}>
          {NOTES.map(([a, b], i) => { const at = 34 + i * 14, p = sp(t, at, 13, 260); return t >= at && (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: 22, padding: "24px 26px", borderRadius: 34, background: "rgba(40,44,58,.85)", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -40}px) scale(${0.94 + 0.06 * p})` }}>
              <div style={{ position: "relative", width: 64, height: 64, borderRadius: 18, background: "#0E1018", flex: "none" }}><Spark x={32} y={32} size={22} id={`n${i}`} glow={0.4} /></div>
              <div><div style={{ ...UI, fontWeight: 700, fontSize: 30, color: C.chalk }}>{a}</div><div style={{ ...UI, fontSize: 26, color: C.mute }}>Gemini · {b}</div></div>
            </div>); })}
        </div>
      </div>
    </div>
  );
}

// ── 6 · the end: the mark, the name, the line ────────────────────────────────────────────────────────
function End({ f }) {
  const t = f - S.end;
  return (
    <>
      <Mark f={f} at={S.end + 4} cy={740} size={240} sub="Just hand it over." subAt={VO.over.at} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...MONO, fontSize: 20, color: "rgba(243,244,248,.45)", letterSpacing: "0.14em", opacity: after(f, VO.over.at + 10, [0, 12], [0, 1]) }}>SPEC AD · UNOFFICIAL · NOT AFFILIATED WITH GOOGLE<br /><br />MOTION BY APPIFY @APPIFYLB</div>
    </>
  );
}

export const Main = () => {
  useFonts([["Sans", "dm-sans-latin-500-normal.woff2", { weight: "500" }], ["Sans", "dm-sans-latin-700-normal.woff2", { weight: "700" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const night = interpolate(f, [S.sleep - 4, S.sleep + 10, S.end - 4, S.end + 10], [0, 1, 1, 0], clamp);
  const flash = f >= S.name && f < S.name + 6 ? interpolate(f - S.name, [0, 1, 6], [0.7, 0.35, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Bg f={f} night={night} />
      <Stage W={W} H={H}>
        {f < S.hand + 10 && <Ask f={f} />}
        {f >= S.hand && f < S.name + 2 && <Hand f={f} />}
        {f >= S.name && f < S.plans + 6 && <div style={{ opacity: interpolate(f, [S.plans - 2, S.plans + 6], [1, 0], clamp) }}><Mark f={f} at={S.name} cy={800} size={250} /></div>}
        {f >= S.plans && f < S.codes + 8 && <Plans f={f} />}
        {f >= S.codes && f < S.sees + 8 && <Codes f={f} />}
        {f >= S.sees && f < S.builds + 8 && <Sees f={f} />}
        {f >= S.builds && f < S.sleep + 8 && <Builds f={f} />}
        {f >= S.sleep && f < S.end + 10 && <Sleep f={f} />}
        {f >= S.end && <End f={f} />}
      </Stage>
      {flash > 0 && <AbsoluteFill style={{ background: "#EDE7FF", opacity: flash, mixBlendMode: "screen" }} />}
      <Audio src={staticFile("sound.wav")} />
      <Vignette strength={0.25} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};
