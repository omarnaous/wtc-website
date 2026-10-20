// "FDM — Issue 01": the Follies d'Après-Midi lookbook as a printed magazine. Cover (the model standing in front of the
// masthead), three spreads where the lookbook frames land on the beat, page turns between them, and an appify back
// issue with Dev as the cover star. Photos are the brand's lookbook; type is the house's (Giaza, Bodoni).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { FPS, BEAT, DROP, FLIPS, FLIP, PAGES, DURATION } from "./mag-timing.js";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { WORDMARK } from "./brand.js";
import { DevBags } from "./DevBags.jsx";

const C = { paper: "#F2EDE6", ink: "#0C0B0A", orange: "#F27043", night: "#0A0913", iris: "#8F72FF", uv: "#5B2BFF" };
const G = { fontFamily: "Giaza", lineHeight: 0.86 };
const BO = { fontFamily: "Bodoni", fontStyle: "italic" };
const FIG = { fontFamily: "Figures" };
const CAPS = { fontFamily: "UI", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const silk = Easing.bezier(0.19, 1, 0.22, 1), cut = Easing.bezier(0.76, 0, 0.24, 1);
const sp = (f, at, d = 16, s = 160) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });
const fade = (f, at, d = 14) => interpolate(f, [at, at + d], [0, 1], clamp);
const rise = (f, at, px = 26) => ({ opacity: fade(f, at, 14), transform: `translateY(${interpolate(f, [at, at + 26], [px, 0], { ...clamp, easing: silk })}px)` });

// letters that rise out of a mask (accents padded so they never clip)
function Rise({ text, f, at, stagger = 1.8, style }) {
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingTop: "0.3em", marginTop: "-0.3em", paddingBottom: "0.1em", marginBottom: "-0.1em" }}>
          <span style={{ display: "block", transform: `translateY(${interpolate(f - at - i * stagger, [0, 18], [112, 0], { ...clamp, easing: silk })}%)` }}>{ch}</span>
        </span>
      ))}
    </span>
  );
}

// a photograph in a frame: the mask wipes up, the picture settles from a slight zoom
function Frame({ src, x, y, w, h, f, at, focus = "50% 35%", caption, num, dark }) {
  const r = interpolate(f, [at, at + 18], [100, 0], { ...clamp, easing: cut });
  const s = interpolate(f, [at, at + 70], [1.18, 1.0], { ...clamp, easing: silk });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      <div style={{ width: w, height: h, overflow: "hidden", clipPath: `inset(${r}% 0 0 0)`, background: "#ddd" }}>
        <Img src={staticFile(`look/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, transform: `scale(${s})` }} />
      </div>
      {caption && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, ...CAPS, fontSize: 15, color: dark ? "rgba(242,237,230,.6)" : "rgba(12,11,10,.55)", opacity: fade(f, at + 12) }}>
          <span>{caption}</span><span style={{ ...FIG, letterSpacing: 0, fontSize: 20 }}>{num}</span>
        </div>
      )}
    </div>
  );
}

// running header and folio, like a printed page
function Folio({ f, at, page, dark, section }) {
  const col = dark ? "rgba(242,237,230,.7)" : "rgba(12,11,10,.6)";
  return (
    <>
      <div style={{ position: "absolute", left: 70, right: 70, top: 200, display: "flex", justifyContent: "space-between", ...CAPS, fontSize: 16, color: col, opacity: fade(f, at) }}>
        <span>Follies d'après-midi</span><span>{section}</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 236, height: 1, background: col, opacity: 0.4, transform: `scaleX(${interpolate(f, [at, at + 30], [0, 1], { ...clamp, easing: silk })})`, transformOrigin: "left" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1640, display: "flex", justifyContent: "space-between", alignItems: "baseline", color: col, opacity: fade(f, at + 6) }}>
        <span style={{ ...CAPS, fontSize: 14 }}>Issue 01 — Beirut</span><span style={{ ...FIG, fontSize: 30 }}>{page}</span>
      </div>
    </>
  );
}

// ── the cover: the model in front of the masthead ─────────────────────────────────────────────────────────────
function Cover({ f }) {
  const push = interpolate(f, [0, 140], [1.12, 1.0], { ...clamp, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  const hit = f >= DROP ? 1 + 0.035 * Math.exp(-(f - DROP) / 6) : 1;
  const photo = { position: "absolute", left: "50%", top: 0, height: 1920, width: 1536, transform: `translateX(-50%) scale(${push * hit})`, transformOrigin: "50% 40%" };
  const orange = f >= DROP && f < DROP + 4;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Img src={staticFile("look/10.jpg")} style={{ ...photo, objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.22), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,.4))" }} />
      {/* masthead, behind her */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", ...G, fontSize: 262, color: orange ? C.orange : C.paper, letterSpacing: "-0.01em" }}>
        <Rise text="FOLLIES" f={f} at={4} stagger={3} />
      </div>
      <Img src={staticFile("cutfull/10.png")} style={{ ...photo, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", ...CAPS, fontSize: 20, color: C.paper, ...rise(f, 26) }}>D'après-midi · Beirut · Issue 01</div>
      {/* cover lines */}
      <div style={{ position: "absolute", left: 70, top: 1080, color: C.paper }}>
        <div style={{ ...CAPS, fontSize: 18, color: C.orange, ...rise(f, DROP + 2) }}>The collection</div>
        <div style={{ ...BO, fontSize: 104, lineHeight: 1, marginTop: 14 }}><Rise text="Échappée" f={f} at={DROP + 4} /></div>
        <div style={{ ...G, fontSize: 150, color: C.orange }}><Rise text="4 à 7" f={f} at={DROP + 12} stagger={3} /></div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 1120, textAlign: "right", color: C.paper, ...rise(f, DROP + 20) }}>
        <div style={{ ...CAPS, fontSize: 16 }}>Luxury</div>
        <div style={{ ...BO, fontSize: 56, lineHeight: 1.05 }}>prêt-à-<br />porter</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1560, display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: C.paper, ...rise(f, DROP + 28) }}>
        <div><div style={{ ...BO, fontSize: 52 }}>Épicée. Libre.</div><div style={{ ...CAPS, fontSize: 14, marginTop: 10, opacity: 0.8 }}>Designed & produced in Lebanon</div></div>
        <svg width="150" height="70" viewBox="0 0 150 70">{Array.from({ length: 30 }, (_, k) => <rect key={k} x={k * 5} y={0} width={(k * 7) % 3 === 0 ? 3 : 1.6} height={56} fill={C.paper} />)}<text x="75" y="69" textAnchor="middle" fontSize="11" fill={C.paper} fontFamily="UI" letterSpacing="2">33.8938 N</text></svg>
      </div>
    </AbsoluteFill>
  );
}

// ── spread 1: Look 01, three frames ──────────────────────────────────────────────────────────────────────────
function Spread1({ f }) {
  const a = PAGES[1].from;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Folio f={f} at={a} page="02" section="Look 01 / 04" />
      <div style={{ position: "absolute", left: 66, top: 270, ...BO, fontSize: 168, color: C.ink, lineHeight: 1 }}><Rise text="Épicée." f={f} at={a + 4} /></div>
      <Frame src="01" x={70} y={480} w={590} h={760} f={f} at={a + 8} caption="Front" num="01" />
      <Frame src="02" x={690} y={480} w={320} h={360} f={f} at={a + 8 + BEAT} focus="50% 30%" caption="Side" num="02" />
      <Frame src="03" x={690} y={880} w={320} h={360} f={f} at={a + 8 + 2 * BEAT} focus="50% 30%" caption="Back" num="03" />
      <div style={{ position: "absolute", left: 70, width: 800, top: 1340, ...BO, fontSize: 50, lineHeight: 1.22, color: C.ink, ...rise(f, a + 8 + 3 * BEAT) }}>
        “Luxury prêt-à-porter, designed and produced in limited quantities in Lebanon.”
      </div>
      <div style={{ position: "absolute", left: 70, top: 1540, ...CAPS, fontSize: 14, color: C.orange, ...rise(f, a + 8 + 3 * BEAT + 6) }}>— Follies d'Après-Midi</div>
    </AbsoluteFill>
  );
}

// ── spread 2: Look 02 breaks out of its frame ─────────────────────────────────────────────────────────────────
function Spread2({ f }) {
  const a = PAGES[2].from;
  const fx = 150, fy = 560, fw = 780, fh = 980;
  const r = interpolate(f, [a + 6, a + 24], [100, 0], { ...clamp, easing: cut });
  const s = interpolate(f, [a + 6, a + 100], [1.14, 1.0], { ...clamp, easing: silk });
  const pop = sp(f, a + 6 + BEAT * 2, 13, 150);
  // the photo is 1600x2000; fit it to the frame width and keep the cut-out on exactly the same transform
  const pw = fw * 1.18, ph = pw * 1.25, px = (fw - pw) / 2, py = fh - ph + 30;
  const pic = (src, extra) => <Img src={staticFile(src)} style={{ position: "absolute", left: px, top: py, width: pw, height: ph, transform: `scale(${s})`, transformOrigin: "50% 100%", ...extra }} />;
  return (
    <AbsoluteFill style={{ background: C.orange }}>
      <Folio f={f} at={a} page="03" section="Look 02 / 04" dark />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", ...G, fontSize: 330, color: C.paper }}><Rise text="LIBRE." f={f} at={a + 2} stagger={2.6} /></div>
      <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", clipPath: `inset(${r}% 0 0 0)` }}>{pic("look/04.jpg")}</div>
        {/* she steps out over the top edge of her frame */}
        <div style={{ position: "absolute", left: 0, top: -400, width: fw, height: fh + 400, overflow: "hidden", clipPath: `inset(0 0 ${fh * 0.6}px 0)`, opacity: Math.min(1, pop * 1.5) }}>
          <div style={{ position: "absolute", left: 0, top: 400, width: fw, height: fh }}>{pic("cutfull/04.png")}</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: fh + 16, right: 0, display: "flex", justifyContent: "space-between", ...CAPS, fontSize: 15, color: C.ink, opacity: fade(f, a + 20) }}>
          <span>Look 02 — the purple blouse</span><span style={{ ...FIG, letterSpacing: 0, fontSize: 20 }}>04</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── spread 3: the contact sheet, twelve frames on the 8ths, then a push into the last ─────────────────────────
function Spread3({ f }) {
  const a = PAGES[3].from;
  const cols = 3, gap = 22, cw = (1080 - 140 - gap * 2) / 3, ch = 314;
  const push = interpolate(f, [a + 100, a + 120], [1, 1.9], { ...clamp, easing: cut });
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Folio f={f} at={a} page="04" section="The lookbook" dark />
      <div style={{ position: "absolute", left: 66, top: 266, ...BO, fontSize: 120, color: C.paper, lineHeight: 1 }}><Rise text="Twelve frames." f={f} at={a + 2} stagger={1.4} /></div>
      <div style={{ position: "absolute", left: 70, top: 440, width: 940, transform: `scale(${push})`, transformOrigin: "85% 92%" }}>
        {Array.from({ length: 12 }, (_, k) => {
          const id = String(k + 1).padStart(2, "0");
          return <Frame key={k} src={id} x={(k % cols) * (cw + gap)} y={Math.floor(k / cols) * (ch * 0.78 + 44)} w={cw} h={ch * 0.78} f={f} at={a + 6 + k * 7.5} focus="50% 28%" caption={`Look ${String(Math.floor(k / 3) + 1).padStart(2, "0")}`} num={id} dark />;
        })}
      </div>
    </AbsoluteFill>
  );
}

// ── back cover: the appify issue, Dev as the cover star ──────────────────────────────────────────────────────
function Back({ f }) {
  const a = PAGES[4].from, t = f - a;
  const card = sp(f, a + 2, 15, 120), dev = sp(f, a + 14, 13, 180), offer = sp(f, a + 40, 9, 280), cta = sp(f, a + 58, 9, 260);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 70) / 4);
  const wm = 420, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #08070F, ${C.night} 60%, #120B26)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 38%, rgba(91,43,255,${0.28 + 0.05 * Math.sin(t / 7)}), transparent 60%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 196, textAlign: "center", ...CAPS, fontSize: 20, color: C.iris, ...rise(f, a + 4) }}>@appifylb · the website issue</div>
      {/* the magazine cover, tilted, with Dev on it */}
      <div style={{ position: "absolute", left: 175, top: 280, width: 730, height: 960, transform: `translateY(${(1 - card) * 900}px) rotate(${-3 + (1 - card) * -8}deg)`, boxShadow: "0 50px 120px rgba(0,0,0,.6)", background: C.paper, overflow: "hidden" }}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 70%, rgba(242,112,67,.32), rgba(242,237,230,0) 60%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 36, display: "flex", justifyContent: "center" }}>
          <svg width={wm} height={wmh} viewBox={WORDMARK.viewBox}><path d={WORDMARK.letters} fill={C.ink} /><path d={WORDMARK.spark} fill={C.orange} /></svg>
        </div>
        <div style={{ position: "absolute", left: 34, right: 34, top: 36 + wmh + 6, display: "flex", justifyContent: "space-between", ...CAPS, fontSize: 12, color: "rgba(12,11,10,.6)" }}><span>Issue 01</span><span>Websites · apps · motion</span></div>
        <div style={{ position: "absolute", left: 350, top: 262, transform: `translateY(${(1 - Math.min(1, dev)) * 600}px)` }}>
          <DevBags width={360} t={t} tilt={Math.sin(t / 9) * 2.5} bob={Math.sin(t / 7) * 3} face={{ brow: 16, lid: t % 80 > 76 ? 1 : 0.05, smile: 1, look: 4, happy: t > 30 ? 1 : 0, wink: t > 46 && t < 62 ? 1 : 0 }} />
        </div>
        <div style={{ position: "absolute", left: 34, top: 330, width: 300, color: C.ink }}>
          <div style={{ ...CAPS, fontSize: 13, color: C.orange, ...rise(f, a + 24) }}>Cover story</div>
          <div style={{ ...BO, fontSize: 54, lineHeight: 1.04, marginTop: 10, ...rise(f, a + 28) }}>Websites that look this expensive</div>
        </div>
        <div style={{ position: "absolute", left: 34, top: 660, textAlign: "left", color: C.ink, transform: `scale(${interpolate(offer, [0, 1], [1.6, 1])})`, transformOrigin: "0% 50%", opacity: Math.min(1, offer * 2) }}>
          <div style={{ ...CAPS, fontSize: 13 }}>From</div>
          <div style={{ ...G, fontSize: 112, color: C.orange, lineHeight: 0.9 }}>$500</div>
          <div style={{ ...CAPS, fontSize: 12, marginTop: 14, color: "rgba(12,11,10,.6)" }}>Designed & built in Beirut</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
        <div style={{ padding: "20px 48px", borderRadius: 30, background: C.orange, textAlign: "center", boxShadow: "0 20px 60px rgba(242,112,67,.35)" }}>
          <div style={{ fontFamily: "Mono", fontSize: 24, color: C.night, letterSpacing: "0.2em" }}>DM</div>
          <div style={{ ...D, fontSize: 68, color: C.night, marginTop: 6 }}>“ANIMATED WEBSITE”</div>
          <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 28, color: C.night, marginTop: 8 }}>for a website like this</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, textAlign: "center", fontFamily: "UIR", fontSize: 24, color: "rgba(255,255,255,.62)", ...rise(f, a + 74) }}>Follies d'Après-Midi · designed & built by Appify</div>
    </AbsoluteFill>
  );
}

const SCENES = { cover: Cover, spread1: Spread1, spread2: Spread2, spread3: Spread3, back: Back };

// the page turn: the outgoing page swings away around its left edge (the spine), the next page is underneath
function Pages({ f }) {
  let i = 0; PAGES.forEach((p, k) => { if (f >= p.from) i = k; });
  const cur = PAGES[i], next = PAGES[i + 1];
  const flipAt = next ? next.from - FLIP : Infinity;
  const Cur = SCENES[cur.key];
  if (f < flipAt) return <Cur f={f} />;
  const Next = SCENES[next.key];
  const t = interpolate(f, [flipAt, next.from], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.35, 1) });
  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <Next f={next.from} />
      <AbsoluteFill style={{ background: "#000", opacity: 0.35 * (1 - t) }} />
      <AbsoluteFill style={{ transformOrigin: "0% 50%", transform: `rotateY(${-t * 100}deg)`, backfaceVisibility: "hidden", boxShadow: `${30 * t}px 0 80px rgba(0,0,0,${0.5 * t})` }}>
        <Cur f={f} />
        <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.35 * t}), rgba(255,255,255,${0.12 * t}) 60%, rgba(0,0,0,${0.25 * t}))` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const Magazine = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Giaza", "fonts/Giaza.otf"], ["Bodoni", "fonts/BodoniFLF-Italic.ttf", { style: "italic" }], ["Figures", "fonts/BodoniModa-600.woff2"],
    ["UI", "Geist-600.ttf", { weight: "600" }], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"], ["Display", "Sora-600.ttf", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Pages f={f} />
      <Grain f={f} opacity={0.06} />
      <Audio src={staticFile(music ? "mag.wav" : "mag-sfx.wav")} />
    </AbsoluteFill>
  );
};
