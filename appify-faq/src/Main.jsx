// Appify Q&A, one Instagram Story per question (1080 x 1920), made to look like Instagram's own Q&A: the question
// sticker with the Appify profile picture on top, the answer in Instagram's highlighted-text style, and a native
// sticker per Story (photo, countdown, quiz, hashtags, link) on its own background, so the highlight never repeats
// itself. Everything is placed the way you'd place stickers: it pops in with a little overshoot and settles at a slight
// angle. All inside the Story safe area (the top bar and the reply bar never cover it).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Q, A, B, C, D, E, TAP } from "./timing.js";
import { useFonts, clamp, easeOut, Grain } from "./fx.jsx";
import { sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";
import { FAQS } from "./faqs.js";

const W = 1080, H = 1920;
const C0 = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", lilac: "#ECE8FF", green: "#2ED47A" };
const CLASSIC = { fontFamily: "UI", fontWeight: 600, letterSpacing: "-0.01em" };       // Instagram "Classic"
const STRONG = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.035em" };   // Instagram "Strong"/"Modern"
const TYPE = { fontFamily: "Mono", fontWeight: 500, letterSpacing: "0.02em" };          // Instagram "Typewriter"
const sp = (f, at, damping = 11, stiffness = 240) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
// a sticker being placed: scale up past 1, settle; slight rotation settles too
const place = (f, at, tilt = 0) => { const p = sp(f, at); return { opacity: Math.min(1, p * 3), transform: `scale(${interpolate(Math.min(p, 1.12), [0, 1], [0.2, 1])}) rotate(${tilt + (1 - Math.min(1, p)) * -14}deg)` }; };
const Spark = ({ size, color = C0.iris }) => <svg width={size} height={size} viewBox="0 0 100 100"><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;

const BG = {
  violet: { bg: "linear-gradient(160deg, #3A1BB0 0%, #5B2BFF 45%, #8F72FF 100%)", text: "#fff", hl: "#fff", hlText: C0.uv, band: "linear-gradient(110deg, #5B2BFF, #8F72FF)" },
  ocean: { bg: "linear-gradient(170deg, #0B1E6E 0%, #1F4FD8 55%, #74C6FF 100%)", text: "#fff", hl: "#fff", hlText: "#1F3FBF", band: "linear-gradient(110deg, #1F4FD8, #74C6FF)" },
  lilac: { bg: "linear-gradient(170deg, #F4F1FF 0%, #E2DBFF 100%)", text: C0.ink, hl: C0.uv, hlText: "#fff", band: "linear-gradient(110deg, #5B2BFF, #B48CFF)" },
  ink: { bg: "radial-gradient(ellipse 80% 50% at 50% 55%, #2A1670 0%, #0A0913 70%)", text: "#fff", hl: "#fff", hlText: C0.ink, band: "linear-gradient(110deg, #5B2BFF, #74C6FF)" },
  photoApp: { photo: "img/home.jpg", text: "#fff", hl: "#fff", hlText: C0.uv, band: "linear-gradient(110deg, #5B2BFF, #8F72FF)" },
  magenta: { bg: "linear-gradient(160deg, #4B12B8 0%, #8A2BE2 50%, #E0479E 100%)", text: "#fff", hl: "#fff", hlText: "#8A2BE2", band: "linear-gradient(110deg, #8A2BE2, #E0479E)" },
  midnight: { bg: "linear-gradient(175deg, #05061A 0%, #14104A 60%, #2B1C8F 100%)", text: "#fff", hl: C0.sky, hlText: C0.ink, band: "linear-gradient(110deg, #5B2BFF, #74C6FF)" },
  violet2: { bg: "linear-gradient(200deg, #22106E 0%, #5B2BFF 55%, #74C6FF 120%)", text: "#fff", hl: "#fff", hlText: C0.uv, band: "linear-gradient(110deg, #5B2BFF, #2ED47A)" },
};

function Background({ f, theme }) {
  const t = BG[theme];
  if (t.photo) return (
    <AbsoluteFill>
      <Img src={staticFile(t.photo)} style={{ position: "absolute", left: -40, top: -40, width: W + 80, height: H + 80, objectFit: "cover", filter: "blur(28px) saturate(1.2)", transform: `scale(${1.05 + f * 0.0002})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,9,19,.55), rgba(40,20,140,.55) 60%, rgba(10,9,19,.7))" }} />
    </AbsoluteFill>
  );
  return <AbsoluteFill style={{ background: t.bg }} />;
}

// Instagram's question sticker as it looks when you share a reply: profile picture on top, the prompt in a coloured
// band, the question underneath in black.
function QSticker({ f, q, tilt, band }) {
  return (
    <div style={{ position: "absolute", left: 160, width: 760, top: 330, ...place(f, Q, tilt), transformOrigin: "50% 50%" }}>
      <div style={{ position: "relative", borderRadius: 38, background: "#fff", boxShadow: "0 26px 60px rgba(10,9,19,.35)" }}>
        <div style={{ position: "absolute", left: "50%", top: -64, width: 128, height: 128, marginLeft: -64, borderRadius: 64, overflow: "hidden", border: "7px solid #fff", boxShadow: "0 6px 18px rgba(10,9,19,.25)" }}>
          <Img src={staticFile("img/avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ padding: "80px 30px 26px", borderRadius: "38px 38px 0 0", background: band, textAlign: "center", ...CLASSIC, fontSize: 36, color: "#fff" }}>Ask Appify a question</div>
        <div style={{ padding: "36px 44px 44px", textAlign: "center", ...CLASSIC, fontSize: 52, lineHeight: 1.2, color: "#111" }}>{q}</div>
      </div>
    </div>
  );
}

// Instagram's highlighted text: each line on its own rounded colour block.
function HiText({ f, at, lines, theme, size = 64, font = STRONG, align = "center", top, left = 90, width = 900, step = 8 }) {
  const t = BG[theme];
  return (
    <div style={{ position: "absolute", left, width, top, textAlign: align, display: "grid", justifyItems: align === "center" ? "center" : "start", gap: 10 }}>
      {lines.map((l, k) => (
        <div key={l} style={{ ...place(f, at + k * step, 0), transformOrigin: align === "center" ? "50% 50%" : "0 50%" }}>
          <span style={{ display: "inline", ...font, fontSize: k === 0 ? size : Math.min(size * 0.72, 58), lineHeight: 1.5, color: t.hlText, background: t.hl, padding: "6px 22px", borderRadius: 16, WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}
// plain Story text (Instagram "Typewriter"), used for the supporting line
const Note = ({ f, at, text, color = "#fff", top, size = 40, width = 860, left = 110, align = "center" }) => (
  <div style={{ position: "absolute", left, width, top, textAlign: align, ...TYPE, fontSize: size, lineHeight: 1.35, color, opacity: Math.min(1, sp(f, at) * 2), transform: `translateY(${(1 - Math.min(1, sp(f, at))) * 24}px)`, textShadow: color === "#fff" ? "0 2px 12px rgba(10,9,19,.35)" : "none" }}>{text}</div>
);
const Photo = ({ f, at, src, w, h, x, y, tilt, tag, fit = "cover" }) => (
  <div style={{ position: "absolute", left: x, top: y, ...place(f, at, tilt) }}>
    <div style={{ padding: 14, paddingBottom: tag ? 54 : 14, background: "#fff", borderRadius: 18, boxShadow: "0 24px 50px rgba(10,9,19,.4)" }}>
      <Img src={staticFile(src)} style={{ display: "block", width: w, height: h, objectFit: fit, objectPosition: "top", borderRadius: 8 }} />
      {tag && <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", ...TYPE, fontSize: 22, color: "#333" }}>{tag}</div>}
    </div>
  </div>
);
// Instagram link sticker: white pill, link glyph, upper-case text in the accent colour
const Link = ({ f, at, text, x, y, tilt = -2, color = C0.uv }) => (
  <div style={{ position: "absolute", left: x, top: y, ...place(f, at, tilt) }}>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "20px 30px", borderRadius: 18, background: "#fff", boxShadow: "0 16px 40px rgba(10,9,19,.35)", ...CLASSIC, fontSize: 36, color, textTransform: "uppercase", letterSpacing: "0.01em" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>{text}
    </div>
  </div>
);
// Dev as a GIF sticker: bobbing a little, as GIF stickers do
const DevSticker = ({ f, at, x, y, w = 300, pose = {} }) => (
  <div style={{ position: "absolute", left: x, top: y, ...place(f, at, 0), transformOrigin: "50% 100%" }}>
    <div style={{ transform: `translateY(${Math.sin(f / 7) * 6}px) rotate(${Math.sin(f / 11) * 3}deg)`, transformOrigin: "50% 100%", filter: "drop-shadow(0 18px 30px rgba(10,9,19,.35))" }}>
      <Dev width={w} brow={14} lid={0.06} smile={1} happy={0.7} look={-3} {...pose} />
    </div>
  </div>
);

// Instagram's quiz sticker: the right option is tapped and turns green, the wrong one stays.
function Quiz({ f, quiz, y, tilt }) {
  const tap = f >= TAP, hit = sp(f, TAP, 10, 300);
  return (
    <div style={{ position: "absolute", left: 140, width: 800, top: y, ...place(f, A, tilt) }}>
      <div style={{ borderRadius: 34, background: "#fff", overflow: "hidden", boxShadow: "0 26px 60px rgba(10,9,19,.35)" }}>
        <div style={{ padding: "30px 36px", background: "linear-gradient(110deg, #5B2BFF, #8F72FF)", textAlign: "center", ...CLASSIC, fontSize: 44, color: "#fff" }}>{quiz.title}</div>
        <div style={{ padding: 26, display: "grid", gap: 16 }}>
          {quiz.options.map((o, k) => {
            const right = k === quiz.right, lit = tap && right;
            return (
              <div key={o} style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px", borderRadius: 20, border: `3px solid ${lit ? C0.green : "#E4E1EE"}`, background: lit ? C0.green : "#fff", transform: lit ? `scale(${interpolate(Math.min(hit, 1.1), [0, 1], [0.94, 1])})` : "none" }}>
                <span style={{ width: 54, height: 54, borderRadius: 27, flex: "none", display: "grid", placeItems: "center", background: lit ? "#fff" : "#F1EFF7", ...CLASSIC, fontSize: 30, color: lit ? C0.green : "#555" }}>{lit ? "✓" : String.fromCharCode(65 + k)}</span>
                <span style={{ ...CLASSIC, fontSize: 40, color: lit ? "#fff" : tap ? "#9A97A6" : "#111", textDecoration: tap && !right ? "line-through" : "none" }}>{o}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* the tap */}
      {f >= TAP - 10 && f < TAP + 16 && <div style={{ position: "absolute", left: 560, top: quiz.options.length === 2 ? 268 : 268, width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 35, border: "5px solid rgba(255,255,255,.95)", background: "rgba(255,255,255,.35)", opacity: interpolate(f, [TAP - 10, TAP, TAP + 16], [0, 1, 0], clamp), transform: `scale(${interpolate(f, [TAP - 10, TAP, TAP + 16], [1.4, 0.8, 1.6], clamp)})` }} />}
    </div>
  );
}

// Instagram's countdown sticker
function Countdown({ f, y }) {
  // just under 7 days, ticking down a minute at a time like the real sticker
  const left = 7 * 24 * 60 - 1 - Math.floor(Math.max(0, f - B) / 30), dd = Math.floor(left / 1440), hh = Math.floor((left % 1440) / 60), mm = left % 60;
  const cell = (v, l) => <div style={{ display: "grid", justifyItems: "center", gap: 8 }}><div style={{ ...STRONG, fontSize: 96, color: "#1F3FBF", background: "#EEF2FF", borderRadius: 18, padding: "12px 18px", minWidth: 150, textAlign: "center" }}>{String(v).padStart(2, "0")}</div><span style={{ ...CLASSIC, fontSize: 26, color: "#7A7F99" }}>{l}</span></div>;
  return (
    <div style={{ position: "absolute", left: 120, width: 840, top: y, ...place(f, A, -2) }}>
      <div style={{ borderRadius: 34, background: "#fff", padding: "34px 40px 36px", boxShadow: "0 26px 60px rgba(10,9,19,.35)", display: "grid", gap: 24, justifyItems: "center" }}>
        <div style={{ ...CLASSIC, fontSize: 40, color: "#111" }}>Your website goes live in under</div>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>{cell(dd, "days")}{cell(hh, "hours")}{cell(mm, "minutes")}</div>
      </div>
    </div>
  );
}

const Hashtag = ({ f, at, text, x, y, tilt }) => (
  <div style={{ position: "absolute", left: x, top: y, ...place(f, at, tilt) }}>
    <span style={{ display: "inline-block", padding: "16px 26px", borderRadius: 16, background: "#fff", ...STRONG, fontSize: 44, letterSpacing: "-0.01em", backgroundClip: "padding-box", boxShadow: "0 14px 30px rgba(10,9,19,.3)" }}>
      <span style={{ background: "linear-gradient(100deg, #8A2BE2, #E0479E)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{text.toUpperCase()}</span>
    </span>
  </div>
);

function Body({ f, faq }) {
  const t = faq.bg, ink = BG[t].text;
  switch (faq.kind) {
    case "photo": return (<>
      <HiText f={f} at={A} lines={faq.a} theme={t} size={120} top={790} />
      <Note f={f} at={B + 10} text={faq.b} top={1215} size={34} />
      <Photo f={f} at={C} src={faq.photo} w={448} h={280} x={316} y={1300} tilt={-4} tag={faq.photoTag} />
    </>);
    case "countdown": return (<>
      <Countdown f={f} y={800} />
      <HiText f={f} at={C} lines={faq.a} theme={t} size={80} top={1190} />
      <Note f={f} at={D} text={faq.b} top={1330} size={36} width={600} left={90} align="left" />
      <DevSticker f={f} at={E} x={730} y={1240} w={230} pose={{ thumbs: 1 }} />
    </>);
    case "quiz": return (<>
      <Quiz f={f} quiz={faq.quiz} y={790} tilt={faq.id === "Ads" ? 2 : -2} />
      <HiText f={f} at={C + 10} lines={faq.a} theme={t} size={faq.id === "Ads" ? 60 : 70} top={1230} />
      <Note f={f} at={D + 10} text={faq.b} color={ink} top={faq.id === "Ads" ? 1340 : 1420} size={36} />
    </>);
    case "neon": return (<>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", ...STRONG, fontSize: 260, color: "#fff", textShadow: "0 0 30px #8F72FF, 0 0 70px #5B2BFF, 0 0 120px #5B2BFF", ...place(f, A, -3) }}>Yes.</div>
      <div style={{ position: "absolute", left: 140, top: 1110, display: "grid", gap: 18 }}>
        {faq.list.map((x, k) => <div key={x} style={{ display: "flex", alignItems: "center", gap: 20, ...place(f, B + k * 8, 0), transformOrigin: "0 50%" }}><span style={{ width: 56, height: 56, borderRadius: 14, background: C0.green, display: "grid", placeItems: "center", ...CLASSIC, fontSize: 36, color: "#fff" }}>✓</span><span style={{ ...TYPE, fontSize: 46, color: "#fff" }}>{x}</span></div>)}
      </div>
      <Note f={f} at={D} text={"You edit them yourself."} top={1110} left={520} width={460} size={40} align="left" />
      <Note f={f} at={E} text={faq.b} top={1420} size={34} />
    </>);
    case "app": return (<>
      <HiText f={f} at={A} lines={faq.a} theme={t} size={84} top={790} />
      <Note f={f} at={B} text={faq.b} top={930} size={34} />
      <Photo f={f} at={C} src="img/home.jpg" w={230} h={500} x={220} y={1040} tilt={-6} />
      <Photo f={f} at={C + 10} src="img/logging.jpg" w={230} h={500} x={590} y={1030} tilt={5} />
      <Link f={f} at={E} text={faq.link} x={250} y={1470} tilt={-2} />
    </>);
    case "tags": return (<>
      <HiText f={f} at={A} lines={faq.a} theme={t} size={92} top={790} />
      {faq.tags.map((x, k) => <Hashtag key={x} f={f} at={B + k * 7} text={x} x={[110, 520, 90, 560, 300][k]} y={[1030, 1060, 1170, 1190, 1300][k]} tilt={[-5, 4, 3, -4, -2][k]} />)}
      <Note f={f} at={D + 10} text={faq.b} top={1440} size={36} />
    </>);
    default: return (<>
      <HiText f={f} at={A} lines={faq.a} theme={t} size={96} top={800} />
      <Note f={f} at={B + 10} text={faq.b} top={1060} size={38} />
      <Link f={f} at={C + 10} text={faq.link} x={170} y={1250} tilt={-3} color="#1E9E5A" />
      <DevSticker f={f} at={D} x={640} y={1180} w={260} pose={{ wave: 1, waveAng: Math.sin(f / 4) * 16 }} />
    </>);
  }
}

export const Main = ({ faq, index, total, music = true }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const theme = BG[faq.bg];
  return (
    <AbsoluteFill style={{ background: C0.ink, overflow: "hidden" }}>
      <Audio src={staticFile(`sound/${faq.id}${music ? "" : "-sfx"}.wav`)} />
      <Background f={f} theme={faq.bg} />
      <QSticker f={f} q={faq.q} tilt={faq.tilt} band={theme.band} />
      <Body f={f} faq={faq} />
      {/* a small Q&A counter, like a creator's own label */}
      <div style={{ position: "absolute", right: 70, top: 262, ...TYPE, fontSize: 26, color: theme.text, opacity: 0.8 }}>Q&amp;A {index + 1}/{total}</div>
      <Grain f={f} opacity={0.025} />
    </AbsoluteFill>
  );
};

// Highlight cover: the question sticker shape with "Q&A", on the violet background; Instagram crops the centre circle.
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: BG.violet.bg }}>
      <div style={{ position: "absolute", left: 240, top: 720, width: 600, transform: "rotate(-4deg)" }}>
        <div style={{ position: "relative", borderRadius: 44, background: "#fff", boxShadow: "0 30px 70px rgba(10,9,19,.4)" }}>
          <div style={{ position: "absolute", left: "50%", top: -80, width: 160, height: 160, marginLeft: -80, borderRadius: 80, overflow: "hidden", border: "9px solid #fff" }}><Img src={staticFile("img/avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          <div style={{ padding: "96px 0 26px", borderRadius: "44px 44px 0 0", background: BG.violet.band, textAlign: "center" }}><Spark size={40} color="#fff" /></div>
          <div style={{ ...STRONG, fontSize: 190, color: C0.uv, textAlign: "center", padding: "10px 0 30px" }}>Q&amp;A</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export { FAQS };
