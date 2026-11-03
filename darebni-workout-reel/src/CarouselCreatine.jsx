// Instagram carousel (1080x1350, 9 slides): "Creatine: myths vs truth", in Darebni's theme. One still per frame:
// frame k = slide k+1. The 3D tub is Jar3D.jsx; every number is from the sources cited on its slide.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFonts } from "./fx.jsx";
import { B, D, UI, UIR, Phone } from "./Main.jsx";
import { Env, Jar } from "./Jar3D.jsx";

export const CC = { W: 1080, H: 1350, N: 9 };
const INK = "#07071A", PAPER = "#F2F0EA", RED = "#FF4D6A", GRN = "#3DDC97", GOLD = "#FFC94A";
const H = { ...D, color: PAPER };
// Jar3D maps stage px on a 1920-tall frame; on a 1350-tall canvas convert the wanted (x, y, height px)
const jarAt = (x, y, hPx) => ({ pos: [540 + (x - 540) * (398 / 280), 960 - (675 - y) * (398 / 280)], s: (hPx / 280) / 2.3 });

function Frame({ k, children }) {
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(160deg, #171447 0%, #2B2390 55%, #4B3FD6 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 80% 85%, rgba(139,128,255,.45), transparent 55%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(184,176,255,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(184,176,255,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", left: 64, top: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 60, height: 60, borderRadius: 15 }} />
        <span style={{ ...D, fontSize: 40, color: PAPER, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
      <div style={{ position: "absolute", right: 64, top: 70, ...D, fontSize: 30, color: "rgba(242,240,234,.55)", letterSpacing: "0.08em" }}>{k + 1}/{CC.N}</div>
      {children}
      <div style={{ position: "absolute", left: 64, bottom: 50, ...UI, fontSize: 26, color: "rgba(242,240,234,.65)" }}>@darebni_ai</div>
      <div style={{ position: "absolute", right: 64, bottom: 58, display: "flex", gap: 8 }}>
        {Array.from({ length: CC.N }, (_, i) => <div key={i} style={{ width: i === k ? 34 : 10, height: 10, borderRadius: 5, background: i === k ? PAPER : "rgba(242,240,234,.3)" }} />)}
      </div>
    </AbsoluteFill>
  );
}
function JarScene({ x, y, h, spin = 0.25, lid = 0, burst = -1, tilt = 0.16 }) {
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1350} camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <Env /><ambientLight intensity={0.25} /><directionalLight position={[3, 4, 6]} intensity={2.2} />
        <pointLight position={[-4, 1, 3]} intensity={30} color="#8B80FF" /><pointLight position={[4, -2, 2]} intensity={12} color="#B8B0FF" />
        <Jar {...jarAt(x, y, h)} spin={spin} tilt={tilt} lid={lid} burst={burst} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
}
const Tick = ({ bad, size = 58 }) => (
  <div style={{ flex: "none", width: size, height: size, borderRadius: size / 2, background: bad ? RED : GRN, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24">{bad ? <path d="M6 6l12 12M18 6L6 18" stroke={INK} strokeWidth="3.6" strokeLinecap="round" /> : <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />}</svg>
  </div>
);
const Rows = ({ items, bad, size = 46, gap = 0 }) => (
  <div style={{ borderTop: "2px solid rgba(242,240,234,.18)" }}>
    {items.map((t) => (
      <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "24px 0", borderBottom: "2px solid rgba(242,240,234,.18)" }}>
        <Tick bad={bad} /><span style={{ ...UI, fontSize: size, color: PAPER }}>{t}</span>
      </div>
    ))}
  </div>
);
const Source = ({ children }) => <div style={{ position: "absolute", left: 64, right: 64, bottom: 108, ...UIR, fontSize: 25, color: "rgba(242,240,234,.6)" }}>Source: {children}</div>;
// the myth line, struck through in red
function Myth({ n, text, top = 190 }) {
  return (
    <div style={{ position: "absolute", left: 64, right: 64, top, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 12, background: RED, ...D, fontSize: 34, color: PAPER, letterSpacing: "0.08em" }}>Myth #{n}</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 22 }}>
        <div style={{ ...H, fontSize: 96, color: "rgba(242,240,234,.55)" }}>“{text}”</div>
        <div style={{ position: "absolute", left: -8, right: -8, top: "47%", height: 12, borderRadius: 6, background: RED, transform: "rotate(-2deg)", boxShadow: "0 0 24px rgba(255,77,106,.7)" }} />
      </div>
    </div>
  );
}
const Truth = ({ top, children }) => (
  <div style={{ position: "absolute", left: 64, right: 64, top }}>
    <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 12, background: GRN, ...D, fontSize: 34, color: INK, letterSpacing: "0.08em" }}>Truth</div>
    <div style={{ marginTop: 22 }}>{children}</div>
  </div>
);

const SLIDES = [
  // 1. cover
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 170 }}>
        <div style={{ ...H, fontSize: 150 }}>Creatine</div>
        <div style={{ ...H, fontSize: 112, marginTop: 6 }}><span style={{ color: RED }}>Myths</span> <span style={{ color: "rgba(242,240,234,.7)" }}>vs</span> <span style={{ color: GRN }}>truth</span></div>
        <div style={{ ...UI, fontSize: 40, color: "rgba(242,240,234,.85)", marginTop: 26 }}>What the science actually says</div>
      </div>
      <JarScene x={540} y={900} h={470} spin={0.25} lid={0.05} burst={0.3} />
      <div style={{ position: "absolute", right: 64, bottom: 110, width: 96, height: 96, borderRadius: 48, background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(0,0,0,.35)" }}>
        <svg width="46" height="46" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </Frame>
  ),
  // 2. bald
  (k) => (
    <Frame k={k}>
      <Myth n={1} text="It makes you bald" />
      <Truth top={470}>
        <div style={{ ...H, fontSize: 84 }}>It comes from <span style={{ color: GOLD }}>one</span> small study</div>
        <div style={{ marginTop: 26 }}><Rows items={["2009 · 20 rugby players", "Measured a hormone (DHT)", "Never measured hair loss", "Never replicated"]} /></div>
      </Truth>
      <Source>van der Merwe et al., Clin J Sport Med, 2009</Source>
    </Frame>
  ),
  // 3. kidneys
  (k) => (
    <Frame k={k}>
      <Myth n={2} text="It wrecks your kidneys" />
      <Truth top={540}>
        <div style={{ ...H, fontSize: 92 }}>Safe & well tolerated</div>
        <div style={{ ...H, fontSize: 92, color: GRN }}>in healthy people</div>
        <div style={{ ...UI, fontSize: 40, color: "rgba(242,240,234,.85)", marginTop: 22 }}>even in long-term studies, up to 30 g a day for 5 years</div>
        <div style={{ marginTop: 34, display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 24px", borderRadius: 18, background: "rgba(7,7,26,.35)", border: "2px solid rgba(255,201,74,.6)" }}>
          <span style={{ ...D, fontSize: 34, color: GOLD }}>Heads up</span><span style={{ ...UI, fontSize: 32, color: PAPER }}>It can raise creatinine on a blood test. Tell your doctor.</span>
        </div>
      </Truth>
      <Source>International Society of Sports Nutrition, Kreider et al., 2017</Source>
    </Frame>
  ),
  // 4. fat
  (k) => (
    <Frame k={k}>
      <Myth n={3} text="It makes you fat" />
      <Truth top={520}>
        <div style={{ ...D, fontSize: 200, color: GRN, lineHeight: 0.86 }}>It's water</div>
        <div style={{ ...D, fontSize: 200, color: PAPER, lineHeight: 0.86 }}>not fat</div>
        <div style={{ ...UI, fontSize: 40, color: "rgba(242,240,234,.85)", marginTop: 30 }}>Creatine pulls water into your muscles.<br />The scale goes up, your body fat doesn't.</div>
      </Truth>
    </Frame>
  ),
  // 5. it works
  (k) => (
    <Frame k={k}>
      <Myth n={4} text="It doesn't really work" />
      <Truth top={520}>
        <div style={{ ...H, fontSize: 80 }}>22 studies, same training:</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 60, marginTop: 34, height: 380 }}>
          {[[20, "Creatine", true], [12, "Placebo", false]].map(([v, l, hot]) => (
            <div key={l} style={{ width: 260, textAlign: "center" }}>
              <div style={{ ...D, fontSize: 96, color: hot ? GRN : "rgba(242,240,234,.7)" }}>+{v}%</div>
              <div style={{ height: v * 12, marginTop: 10, borderRadius: "20px 20px 0 0", background: hot ? `linear-gradient(180deg, ${GRN}, #1E9E6A)` : "rgba(242,240,234,.25)" }} />
              <div style={{ ...D, fontSize: 38, color: PAPER, marginTop: 14 }}>{l}</div>
            </div>
          ))}
          <div style={{ flex: 1, paddingBottom: 60 }}>
            <div style={{ ...D, fontSize: 90, color: GOLD }}>+14%</div>
            <div style={{ ...UI, fontSize: 34, color: PAPER, lineHeight: 1.2 }}>more reps at the same weight</div>
          </div>
        </div>
      </Truth>
      <Source>Rawson & Volek, J Strength Cond Res, 2003 (average strength gain)</Source>
    </Frame>
  ),
  // 6. bonus: brain
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 200 }}>
        <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 12, background: GOLD, ...D, fontSize: 34, color: INK, letterSpacing: "0.08em" }}>Bonus truth</div>
        <div style={{ ...H, fontSize: 120, marginTop: 24 }}>It's not just</div>
        <div style={{ ...H, fontSize: 120, color: B.xlo }}>for muscles</div>
      </div>
      <svg width="380" height="330" viewBox="-200 -170 400 340" style={{ position: "absolute", left: 690, top: 330, opacity: 0.95, transform: "scale(.85)" }}>
        <circle r="165" fill="rgba(184,176,255,.18)" />
        <path d="M-150,10 C-170,-80 -100,-150 -20,-140 C30,-175 120,-150 140,-80 C190,-50 180,40 130,70 C120,130 40,150 -10,120 C-60,150 -140,120 -140,60 C-170,50 -170,25 -150,10 Z" fill="#FF9BB3" />
        <path d="M-90,-80 C-60,-100 -30,-70 -50,-40 M10,-120 C0,-80 40,-70 30,-40 M80,-90 C110,-70 90,-30 110,0 M-110,20 C-80,10 -60,40 -80,70 M-20,30 C10,0 40,30 20,70 M60,40 C90,30 110,60 90,90" stroke="#D9607F" strokeWidth="10" fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, top: 640 }}>
        <Rows items={["One high dose", "partly improved thinking", "during a night without sleep"]} />
        <div style={{ ...UI, fontSize: 32, color: GOLD, marginTop: 26 }}>Small, early study, and a high experimental dose, not your daily scoop.</div>
      </div>
      <Source>Gordji-Nejad et al., Scientific Reports, 2024</Source>
    </Frame>
  ),
  // 7. how much
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 190 }}>
        <div style={{ ...H, fontSize: 140 }}>How</div>
        <div style={{ ...H, fontSize: 140, color: GRN }}>much?</div>
      </div>
      <JarScene x={810} y={420} h={330} spin={0.35} lid={0.6} burst={0.25} tilt={0.22} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 600, borderTop: "2px solid rgba(242,240,234,.18)", paddingTop: 34 }}>
        <div style={{ ...D, fontSize: 36, color: B.xlo, letterSpacing: "0.1em" }}>Creatine monohydrate</div>
        <div style={{ ...D, fontSize: 230, color: PAPER, textTransform: "none", lineHeight: 0.95, marginTop: 6 }}>3–5 g</div>
        <div style={{ ...H, fontSize: 70, color: GOLD }}>every day</div>
        <div style={{ ...UI, fontSize: 38, color: "rgba(242,240,234,.85)", marginTop: 24 }}>Consistency beats timing. Just take it daily.</div>
      </div>
      <Source>International Society of Sports Nutrition, 2017</Source>
    </Frame>
  ),
  // 8. verdict
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 190 }}>
        <div style={{ ...H, fontSize: 120 }}>The <span style={{ color: GOLD }}>verdict</span></div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 360 }}>
        <div style={{ ...D, fontSize: 44, color: GRN, letterSpacing: "0.06em" }}>Pros</div>
        <Rows items={["Stronger lifts", "More reps", "Safe for healthy people"]} size={42} />
        <div style={{ ...D, fontSize: 44, color: RED, letterSpacing: "0.06em", marginTop: 36 }}>Cons</div>
        <Rows bad items={["A little water weight", "Can flag a blood test", "Results vary per person"]} size={42} />
      </div>
    </Frame>
  ),
  // 9. CTA
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 190 }}>
        <div style={{ ...H, fontSize: 110 }}>Train smart.</div>
        <div style={{ ...H, fontSize: 110, color: GRN }}>Stay informed.</div>
      </div>
      <Phone src="app/tracker.jpg" w={330} x={660} y={470} rot={6} />
      <div style={{ position: "absolute", left: 64, width: 560, top: 470 }}>
        <div style={{ ...UI, fontSize: 40, color: PAPER, lineHeight: 1.25 }}>Your plan, sets, reps and weights, built for you and tracked every set.</div>
        <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 28px", borderRadius: 999, background: PAPER }}>
          <span style={{ ...D, fontSize: 40, color: INK }}>Follow</span><span style={{ ...D, fontSize: 40, color: B.primary }}>@darebni_ai</span>
        </div>
        <div style={{ ...UI, fontSize: 32, color: "rgba(242,240,234,.85)", marginTop: 14 }}>for more tips, tricks & workouts</div>
        <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 30px 14px 14px", borderRadius: 26, background: B.primary, border: `3px solid ${B.lo}` }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 84, height: 84, borderRadius: 20 }} />
          <div><div style={{ ...D, fontSize: 28, color: B.xlo, letterSpacing: "0.04em" }}>Download on the App Store</div><div style={{ ...D, fontSize: 60, color: PAPER }}>Darebni AI</div></div>
        </div>
      </div>
    </Frame>
  ),
];

export const CarouselCreatine = () => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return SLIDES[Math.min(SLIDES.length - 1, f)](f);
};
