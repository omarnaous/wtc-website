// "He trained with Messi & Lamine Yamal. Then he needed a website." Launch reel for pannaking.com (Panna King, coach
// Kassem's street-football academy), built by Appify. Format B from the appify-content playbook:
//   hook on label boxes over his signature-move photo -> a beat-cut rush of his real photos with the players the site
//   names ("TRAINED WITH ..." marquee) -> "Then he needed a website." on the site's lime -> the live homepage in a
//   browser window, one continuous desktop scroll (public/rec, capture.cjs) with a chip per section -> the Appify end
//   card: what the site has, the DM keyword, the credit, Dev holding a football.
// Client look (lime #7FD301, ink, paper, Bebas Neue) for the client part; Appify colours, Sora/Geist and the real
// wordmark for the end card. Photos and the capture are the site's own (public/photos, public/rec; kept out of git).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";
import scroll from "../public/rec/scroll.json";

// 30 fps on a 120 BPM grid: a beat is 15 frames
export const PK = { FPS: 30, BEAT: 15, HOOK: 0, RUSH: 60, TURN: 150, SITE: 195, REC: 420, END: 615, DURATION: 810 };
const { BEAT, RUSH, TURN, SITE, REC, END } = PK;
const C = { lime: "#7FD301", ink: "#121317", paper: "#F5F4F2", night: "#0A0913", ink2: "#15122A", uv: "#5B2BFF", iris: "#8F72FF", yellow: "#FFD23F", mint: "#3DDC97" };
const BB = { fontFamily: "Bebas", lineHeight: 0.88, letterSpacing: "0.01em" };
const S = { fontFamily: "Sora", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.98 };
const UI = { fontFamily: "Geist", fontWeight: 600 };
const UIR = { fontFamily: "GeistR" };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.yellow, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const Cover = ({ src, z = 1, pos = "50% 30%", style }) => <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})`, ...style }} />;

const PLAYERS = [["with-messi", "Messi", "50% 40%"], ["with-auba", "Aubameyang", "50% 30%"], ["with-dembele", "Dembélé", "50% 30%"],
  ["with-mahrez", "Mahrez", "50% 35%"], ["with-dani-alves", "Dani Alves", "50% 25%"], ["with-lamine", "Lamine Yamal", "50% 30%"]];

// ── 1 · hook + rush ──────────────────────────────────────────────────────────────────────────────────────────
function Opening({ f }) {
  const inRush = f >= RUSH, k = inRush ? Math.min(5, Math.floor((f - RUSH) / BEAT)) : -1, t = inRush ? f - RUSH - k * BEAT : f;
  const z = inRush ? 1.16 - 0.12 * Math.min(1, t / 7) : 1.12 - 0.08 * (f / 60);
  const [src, name, pos] = inRush ? PLAYERS[k] : ["handstand", "", "50% 40%"];
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Cover src={`photos/${src}.jpg`} z={z} pos={pos} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 100%)" }} />
      {inRush && <AbsoluteFill style={{ border: `24px solid ${k % 2 ? C.lime : C.paper}` }} />}
      {inRush && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1130 }}>
          <div style={{ ...M, fontSize: 28, color: C.lime, ...rise(sp(t, 0, 12, 320), 20) }}>Trained with · {k + 1}/6</div>
          <div style={{ ...BB, fontSize: name.length > 9 ? 190 : 240, color: "#fff", marginTop: 10, whiteSpace: "nowrap", textShadow: "0 10px 50px rgba(0,0,0,.5)", ...pop(sp(t, 0, 9, 340), 1.5), transformOrigin: "0% 60%" }}>{name}</div>
        </div>
      )}
    </AbsoluteFill>
  );
}
function Hook({ f }) {
  if (f >= TURN) return null;
  const out = interpolate(f, [TURN - 6, TURN], [1, 0], clamp);
  const box = (bg, fg, size) => ({ display: "inline-block", padding: "12px 26px 4px", borderRadius: 16, background: bg, color: fg, ...BB, fontSize: size });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 270, opacity: out }}>
      <div style={pop(sp(f, -4, 11, 300), 1.3)}><span style={box(C.ink, "#fff", 118)}>He trained with <span style={{ color: C.lime }}>Messi</span></span></div>
      <div style={{ marginTop: 10, ...pop(sp(f, 9, 10, 300), 1.5) }}><span style={box(C.lime, C.ink, 118)}>& Lamine Yamal.</span></div>
    </div>
  );
}
function Turn({ f }) {
  const t = f - TURN, flash = interpolate(f, [SITE - 5, SITE - 1, SITE + 2], [0, 1, 0], clamp);
  const ball = sp(t, 0, 11, 180);
  return (
    <AbsoluteFill style={{ background: C.lime, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,.05) 0 2px, transparent 2px 22px)" }} />
      <div style={{ position: "absolute", left: 70, top: 560 }}>
        <div style={{ ...BB, fontSize: 210, color: C.ink, ...pop(sp(t, 0, 9, 340), 1.6), transformOrigin: "0% 60%" }}>Then he</div>
        <div style={{ ...BB, fontSize: 210, color: C.ink, ...pop(sp(t, 8, 9, 340), 1.6), transformOrigin: "0% 60%" }}>needed</div>
        <div style={{ ...pop(sp(t, 16, 9, 340), 1.6), transformOrigin: "0% 60%", marginTop: 10 }}><span style={{ display: "inline-block", ...BB, fontSize: 210, color: C.lime, background: C.ink, padding: "14px 30px 0", borderRadius: 22 }}>a website.</span></div>
      </div>
      <div style={{ position: "absolute", right: 90, top: 380, transform: `translateY(${(1 - Math.min(1, ball)) * -700}px) rotate(${t * 9}deg)` }}><Ball r={110} /></div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
}

// ── 2 · the live site in a browser window: one continuous desktop scroll of the homepage ─────────────────────
const at = (frac) => Math.round(scroll.secs[Object.keys(scroll.secs).find((k) => k.startsWith(frac))] ?? 0);
// a chip turns on when its section's heading reaches the middle of the browser viewport
const chipAt = (y) => { const i = scroll.ys.findIndex((v) => v >= y - 420); return i < 0 ? REC : i; };
const CHIPS = [
  [8, "A hero that sells the dream"], [34, "English + Arabic"],
  [chipAt(at("PROFESSIONAL")), "The pros he trained with"], [chipAt(at("WHY TALENT")), "The pain, called out"],
  [chipAt(at("THE PILLARS")), "His method, step by step"], [chipAt(at("PICK YOUR")), "Courses, straight to the cart"],
  [chipAt(at("HEAR FROM")), "Real reviews"], [chipAt(at("GET THE FREE")), "Free drill pack: emails captured"],
  [chipAt(at("STRAIGHT")), "Straight answers (FAQ)"], [chipAt(at("BECOME")), "Sign-up & student accounts"],
];
const rec = (f) => staticFile(`rec/${String(Math.max(1, Math.min(REC, f - SITE + 1))).padStart(4, "0")}.jpg`);
function Browser({ f, w }) {
  const h = (w * 900) / 1440, i = Math.max(0, Math.min(REC - 1, f - SITE));
  const pos = scroll.ys[i] / (scroll.H - 900), thumb = (h * 900) / scroll.H;
  return (
    <div style={{ width: w, borderRadius: 22, overflow: "hidden", background: "#1A1B20", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 2px rgba(127,211,1,.45), 0 0 80px rgba(127,211,1,.18)" }}>
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "5px 40px", borderRadius: 9, background: "rgba(255,255,255,.08)", ...UIR, fontSize: 18, color: "rgba(255,255,255,.85)" }}>pannaking.com</div>
        </div>
        <div style={{ width: 66 }} />
      </div>
      <div style={{ width: w, height: h, position: "relative", overflow: "hidden" }}>
        <Img src={rec(f)} style={{ width: w, height: h, display: "block" }} />
        <div style={{ position: "absolute", right: 4, top: 4 + pos * (h - thumb - 8), width: 6, height: thumb, borderRadius: 9, background: "rgba(0,0,0,.35)" }} />
      </div>
    </div>
  );
}
function Site({ f }) {
  const t = f - SITE, enter = sp(t, 0, 14, 170);
  const chip = CHIPS.filter(([a]) => t >= a).pop(), n = CHIPS.indexOf(chip);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ transform: "scale(1.3)", filter: "blur(34px) saturate(1.2) brightness(.5)" }}>
        <Img src={rec(f)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.1), rgba(0,0,0,.65))" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 270, textAlign: "center" }}>
        <div style={{ ...BB, fontSize: 130, color: "#fff", ...pop(sp(t, 2, 11, 300), 1.3) }}>Panna <span style={{ color: C.lime }}>King</span></div>
        <div style={{ ...S, fontSize: 52, color: "rgba(255,255,255,.9)", marginTop: 6, ...pop(sp(t, 10, 10, 300), 1.4) }}>designed & built by Appify</div>
      </div>
      <div style={{ position: "absolute", left: 16, top: 500, transform: `translateY(${(1 - enter) * 500}px) scale(${0.92 + 0.08 * enter})`, opacity: Math.min(1, enter * 2) }}>
        <Browser f={f} w={1048} />
      </div>
      {chip && (
        <div key={chip[0]} style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 30px 16px 16px", borderRadius: 99, background: "rgba(18,19,23,.82)", border: `2px solid ${C.lime}`, ...UI, fontSize: 38, color: "#fff", ...pop(sp(t, chip[0], 12, 280), 1.25) }}>
            <span style={{ width: 44, height: 44, borderRadius: 99, background: C.lime, display: "grid", placeItems: "center", ...BB, fontSize: 30, color: C.ink, paddingTop: 4 }}>{n + 1}</span>{chip[1]}
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [0, 6], [0.9, 0], clamp) }} />
    </AbsoluteFill>
  );
}

// ── 3 · the Appify end card: Dev with a football ─────────────────────────────────────────────────────────────
function Ball({ r = 90 }) {
  // a classic football: white with a black centre pentagon and five cut pentagons at the edge
  const pent = (cx, cy, s, rot) => Array.from({ length: 5 }, (_, i) => { const a = rot + (i * 2 * Math.PI) / 5; return `${cx + s * Math.sin(a)},${cy - s * Math.cos(a)}`; }).join(" ");
  return (
    <svg width={r * 2} height={r * 2} viewBox="-100 -100 200 200" style={{ overflow: "visible" }}>
      <defs><clipPath id="ballc"><circle r="92" /></clipPath></defs>
      <circle r="92" fill="#fff" stroke={C.night} strokeWidth="8" />
      <g clipPath="url(#ballc)" fill={C.night}>
        <polygon points={pent(0, 0, 30, Math.PI)} />
        {[0, 1, 2, 3, 4].map((i) => { const a = (i * 2 * Math.PI) / 5 + Math.PI / 5; return <polygon key={i} points={pent(94 * Math.sin(a), -94 * Math.cos(a), 26, a + Math.PI)} />; })}
        {[0, 1, 2, 3, 4].map((i) => { const a = (i * 2 * Math.PI) / 5 + Math.PI / 5; return <line key={`l${i}`} x1={30 * Math.sin(a)} y1={-30 * Math.cos(a)} x2={70 * Math.sin(a)} y2={-70 * Math.cos(a)} stroke={C.night} strokeWidth="5" />; })}
      </g>
      <circle r="92" fill="none" stroke={C.night} strokeWidth="8" />
      <ellipse cx="-34" cy="-46" rx="22" ry="12" fill="#fff" opacity=".55" transform="rotate(-35 -34 -46)" />
    </svg>
  );
}
function DevBall({ width = 320, t = 0, face = {} }) {
  const h = (width * 830) / 420, spin = Math.sin(t / 7) * 10;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} tilt={Math.sin(t / 9) * 2.5} bob={Math.sin(t / 6) * 3} {...face} /></div>
      {/* the ball held in front in both hands (Dev's own coordinates, as DevBags) */}
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(0 ${Math.sin(t / 6) * 3})`}>
          <g transform={`translate(300 742) rotate(${spin})`}><foreignObject x="-96" y="-96" width="192" height="192"><Ball r={96} /></foreignObject></g>
          <circle cx="206" cy="736" r="25" fill="#E3AE86" stroke={C.night} strokeWidth="8" />
          <circle cx="394" cy="736" r="25" fill="#E3AE86" stroke={C.night} strokeWidth="8" />
        </g>
      </svg>
    </div>
  );
}
const FEATURES = ["Courses & cart", "Student accounts & login", "English + Arabic", "Free drill pack lead capture", "Reviews & FAQ"];
function End({ f }) {
  const t = f - END, devP = sp(t, 8, 13, 200), F0 = 22, EIGHTH = 7.5, CTA = F0 + FEATURES.length * EIGHTH + 10;
  const cta = sp(t, CTA, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - CTA - 20) / 4);
  const wm = 300, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #08070F, ${C.night} 55%, ${C.ink2})` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.09) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.09) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 40%, rgba(91,43,255,${0.32 + 0.06 * Math.sin(t / 6)}), transparent 55%)` }} />
      <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 22, ...pop(sp(t, 0, 10, 300)) }}>
        <svg viewBox={WORDMARK.viewBox} width={wm} height={wmh}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.yellow} /></svg>
        <span style={{ ...M, fontSize: 22, color: C.iris }}>@appifylb</span>
      </div>
      <div style={{ position: "absolute", left: 70, top: 380 }}>
        <div style={{ ...S, fontSize: 78, color: "#fff", ...pop(sp(t, 6, 10, 300)) }}>Want a website</div>
        <div style={{ ...S, fontSize: 78, color: C.iris, marginTop: 6, ...pop(sp(t, 12, 10, 300), 1.5) }}>like this?</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 580, width: 560 }}>
        {FEATURES.map((ft, i) => {
          const p = sp(t, F0 + i * EIGHTH, 12, 260);
          return (
            <div key={ft} style={{ display: "flex", alignItems: "center", gap: 16, height: 64, borderBottom: "1px solid rgba(255,255,255,.1)", ...rise(p, 24) }}>
              <div style={{ width: 36, height: 36, borderRadius: 99, background: C.mint, display: "grid", placeItems: "center", transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})` }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={C.night} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ ...UI, fontSize: 33, color: "#fff" }}>{ft}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 70, top: 1000, transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * pulse})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
        <div style={{ padding: "18px 36px", borderRadius: 26, background: C.uv, boxShadow: "0 20px 60px rgba(91,43,255,.45)", display: "inline-block" }}>
          <div style={{ ...M, fontSize: 22, color: C.yellow, letterSpacing: "0.2em", display: "flex", alignItems: "center", gap: 10 }}><Spark size={20} />DM us</div>
          <div style={{ ...S, fontSize: 64, color: "#fff", marginTop: 6 }}>“WEBSITE”</div>
          <div style={{ ...UI, fontSize: 26, color: "rgba(255,255,255,.85)", marginTop: 6 }}>and we'll build yours</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1260, ...UIR, fontSize: 25, color: "rgba(255,255,255,.62)", ...rise(sp(t, CTA + 24, 12, 220)) }}>Panna King · designed & built by Appify</div>
      <div style={{ position: "absolute", left: 640, top: 520, transform: `translateY(${(1 - Math.min(1, devP)) * 800}px)` }}>
        <DevBall width={300} t={t} face={{ brow: 16, lid: t % 80 > 76 ? 1 : 0.05, smile: 1, look: -6, happy: t > 30 ? 1 : 0, open: t > 14 && t < 28 ? 0.5 : 0 }} />
      </div>
    </AbsoluteFill>
  );
}

export const Panna = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Bebas", "fonts/BebasNeue.woff2"], ["Sora", "Sora-600.ttf", { weight: "600" }], ["Geist", "Geist-600.ttf", { weight: "600" }], ["GeistR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const scene = f < TURN ? <Opening f={f} /> : f < SITE ? <Turn f={f} /> : f < END ? <Site f={f} /> : <End f={f} />;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {scene}
      <Hook f={f} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [END - 3, END, END + 4], [0, 0.85, 0], clamp) + interpolate(f, [TURN - 2, TURN, TURN + 4], [0, 0.7, 0], clamp) }} />
      <Grain f={f} opacity={0.05} />
      <Audio src={staticFile(music ? "panna.wav" : "panna-sfx.wav")} />
    </AbsoluteFill>
  );
};

// cover (1080x1920, inside the 3:4 grid crop): the hook on label boxes over his photo with Messi (the line names Messi, so the photo is his), the site tilted
export const PannaThumb = () => {
  useFonts([["Bebas", "fonts/BebasNeue.woff2"], ["Sora", "Sora-600.ttf", { weight: "600" }], ["Geist", "Geist-600.ttf", { weight: "600" }], ["GeistR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const box = (bg, fg, size) => ({ display: "inline-block", padding: "12px 26px 4px", borderRadius: 16, background: bg, color: fg, ...BB, fontSize: size });
  const wm = 210, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Cover src="photos/with-messi.jpg" pos="40% 50%" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,.1) 55%, rgba(0,0,0,.85) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 236, display: "flex", alignItems: "center", gap: 18 }}>
        <svg viewBox={WORDMARK.viewBox} width={wm} height={wmh}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.yellow} /></svg>
        <span style={{ ...M, fontSize: 20, color: "rgba(255,255,255,.85)" }}>@appifylb</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 340 }}>
        <div><span style={box(C.ink, "#fff", 112)}>He trained with <span style={{ color: C.lime }}>Messi</span></span></div>
        <div style={{ marginTop: 10 }}><span style={box(C.lime, C.ink, 112)}>We built his website</span></div>
      </div>
      {/* point Messi out: he is the one in pink, seen in profile */}
      <div style={{ position: "absolute", left: 540, top: 618, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ padding: "8px 20px 2px", borderRadius: 12, background: C.lime, ...BB, fontSize: 52, color: C.ink, boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>Messi</div>
        <svg width="34" height="22" viewBox="0 0 34 22"><path d="M0 0 H34 L17 22 Z" fill={C.lime} /></svg>
      </div>
      <div style={{ position: "absolute", left: 250, top: 1110, width: 780, transform: "rotate(-4deg)", borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.7), 0 0 0 3px rgba(127,211,1,.7)" }}>
        <div style={{ height: 36, background: "#1A1B20", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />)}</div>
        <Img src={staticFile("rec/0040.jpg")} style={{ width: 780, height: 488, display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};
