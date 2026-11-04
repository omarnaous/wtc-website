// Instagram carousel (1080x1350, 9 slides): "Progressive overload + RPE: what the studies say", ending as a Darebni AI ad.
// Same look as CarouselCreatine.jsx (ink, violet glow, 60 px grid). One still per frame: frame k = slide k+1; slide 1 also
// exists as a 6 s motion piece (OverloadCover). Every number is from the study named on its slide:
//   Plotkin et al., PeerJ 2022 (load vs rep progression, 43 trained, 8 wk)
//   Zourdos et al., J Strength Cond Res 2016 (the RIR-based RPE scale)
//   Helms et al., Front Physiol 2018 (RPE vs %1RM, 21 trained men, 8 wk)
//   Graham & Cleather, J Strength Cond Res 2021 (RIR autoregulation vs fixed loading, 12 wk squat)
//   Robinson et al., Sports Med 2024 (proximity to failure meta-regressions)
// App claims are limited to features shown in the reels' end card: plan with sets, reps, rest and RPE; set-by-set tracker;
// weekly follow-up; PR tracker.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "./fx.jsx";
import { B, D, UI, UIR, Phone } from "./Main.jsx";

export const CO = { W: 1080, H: 1350, N: 9 };
const INK = "#07071A", PAPER = "#F2F0EA", RED = "#FF4D6A", GRN = "#3DDC97", GOLD = "#FFC94A";
const H = { ...D, color: PAPER };
const DIM = "rgba(242,240,234,.85)";

function Frame({ k, children }) {
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.35), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", left: 64, top: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 60, height: 60, borderRadius: 15 }} />
        <span style={{ ...D, fontSize: 40, color: PAPER, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
      <div style={{ position: "absolute", right: 64, top: 70, ...D, fontSize: 30, color: "rgba(242,240,234,.55)", letterSpacing: "0.08em" }}>{k + 1}/{CO.N}</div>
      {children}
      <div style={{ position: "absolute", left: 64, bottom: 50, ...UI, fontSize: 26, color: "rgba(242,240,234,.65)" }}>@darebni_ai</div>
      <div style={{ position: "absolute", right: 64, bottom: 58, display: "flex", gap: 8 }}>
        {Array.from({ length: CO.N }, (_, i) => <div key={i} style={{ width: i === k ? 34 : 10, height: 10, borderRadius: 5, background: i === k ? PAPER : "rgba(242,240,234,.3)" }} />)}
      </div>
    </AbsoluteFill>
  );
}
const Tick = ({ size = 54, color = GRN }) => (
  <div style={{ flex: "none", width: size, height: size, borderRadius: size / 2, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
const Rows = ({ items, size = 42, color }) => (
  <div style={{ borderTop: "2px solid rgba(242,240,234,.18)" }}>
    {items.map((t) => (
      <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 0", borderBottom: "2px solid rgba(242,240,234,.18)" }}>
        <Tick color={color} /><span style={{ ...UI, fontSize: size, color: PAPER }}>{t}</span>
      </div>
    ))}
  </div>
);
const Pill = ({ bg, color = INK, children, style }) => (
  <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 12, background: bg, ...D, fontSize: 34, color, letterSpacing: "0.08em", ...style }}>{children}</div>
);
const Source = ({ children }) => <div style={{ position: "absolute", left: 64, right: 64, bottom: 108, ...UIR, fontSize: 25, color: "rgba(242,240,234,.6)" }}>Source: {children}</div>;
const Study = ({ who }) => <Pill bg="rgba(139,128,255,.22)" color={B.xlo} style={{ border: "2px solid rgba(139,128,255,.5)" }}>The study · {who}</Pill>;
const Arrow = ({ style }) => (
  <div style={{ position: "absolute", right: 64, bottom: 110, width: 96, height: 96, borderRadius: 48, background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(0,0,0,.35)", ...style }}>
    <svg width="46" height="46" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

// the cover's staircase: 8 weeks of bars climbing, p = 0..1 per bar (1 = fully up)
const BARS = [0.30, 0.38, 0.44, 0.52, 0.60, 0.68, 0.79, 0.92];
function Stairs({ p = () => 1, line = 1 }) {
  const x0 = 64, w = 800, base = 1150, top = 640, bw = 80, gap = (w - bw * 8) / 7;
  const pts = BARS.map((h, i) => [x0 + i * (bw + gap) + bw / 2, base - (base - top) * h - 26]);
  const len = 1100;
  return (
    <svg width="1080" height="1350" style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8B80FF" /><stop offset="1" stopColor="#3A2FB8" /></linearGradient>
        <linearGradient id="hot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GRN} /><stop offset="1" stopColor="#1E9E6A" /></linearGradient>
      </defs>
      {BARS.map((h, i) => {
        const v = Math.max(0, p(i)), bh = (base - top) * h * v, x = x0 + i * (bw + gap);
        return (
          <g key={i} opacity={Math.min(1, v * 3)}>
            <rect x={x} y={base - bh} width={bw} height={bh} rx="16" fill={i === 7 ? "url(#hot)" : "url(#bar)"} />
            <text x={x + bw / 2} y={base + 48} textAnchor="middle" fill="rgba(242,240,234,.7)" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 32 }}>W{i + 1}</text>
          </g>
        );
      })}
      <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={GOLD} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - line)} />
      {line > 0.98 && <path d={`M${pts[7][0] - 34},${pts[7][1] - 4} L${pts[7][0] + 6},${pts[7][1] - 30} L${pts[7][0] - 6},${pts[7][1] + 18} Z`} fill={GOLD} />}
    </svg>
  );
}
const CoverTitle = ({ w = () => ({}), sub = {} }) => (
  <div style={{ position: "absolute", left: 64, right: 64, top: 170 }}>
    <div style={{ ...H, fontSize: 132 }}><span style={w(0)}>Progressive</span></div>
    <div style={{ ...H, fontSize: 132, color: B.lo }}><span style={w(1)}>overload</span> <span style={{ ...w(2), color: GOLD }}>+ RPE</span></div>
    <div style={{ ...UI, fontSize: 40, color: DIM, marginTop: 24, ...sub }}>How to keep building muscle & strength,<br />according to the studies</div>
  </div>
);

const SLIDES = [
  // 1. cover
  (k) => (
    <Frame k={k}>
      <CoverTitle />
      <Stairs />
      <Arrow />
    </Frame>
  ),
  // 2. what progressive overload is
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 190 }}>
        <Pill bg={GOLD}>The rule</Pill>
        <div style={{ ...H, fontSize: 110, marginTop: 24 }}>Your muscles</div>
        <div style={{ ...H, fontSize: 110 }}>only grow if</div>
        <div style={{ ...H, fontSize: 110, color: GRN }}>the job gets harder</div>
        <div style={{ ...UI, fontSize: 40, color: DIM, marginTop: 24 }}>That's progressive overload. Same weight, same reps, every week = the same body.</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 800 }}>
        <div style={{ ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.1em", marginBottom: 8 }}>Example · bench press</div>
        {[["Week 1", "60 kg × 8"], ["Week 2", "60 kg × 10", "+ reps"], ["Week 3", "62.5 kg × 8", "+ weight"]].map(([a, b, c]) => (
          <div key={a} style={{ display: "flex", alignItems: "center", padding: "18px 0", borderBottom: "2px solid rgba(242,240,234,.18)" }}>
            <span style={{ ...D, fontSize: 40, color: "rgba(242,240,234,.6)", width: 200 }}>{a}</span>
            <span style={{ ...D, fontSize: 54, color: PAPER, flex: 1, textTransform: "none" }}>{b}</span>
            {c && <span style={{ ...D, fontSize: 34, color: INK, background: GRN, padding: "6px 16px", borderRadius: 10 }}>{c}</span>}
          </div>
        ))}
      </div>
    </Frame>
  ),
  // 3. Plotkin 2022
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <Study who="2022" />
        <div style={{ ...H, fontSize: 92, marginTop: 24 }}>Add weight</div>
        <div style={{ ...H, fontSize: 92 }}>or add reps?</div>
        <div style={{ ...UI, fontSize: 38, color: DIM, marginTop: 20 }}>43 trained lifters, 8 weeks of leg training. One group added weight each session, the other added reps.</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 720 }}>
        <Rows items={["Both groups built muscle", "Similar growth either way", "Strength slightly favoured adding weight"]} />
        <div style={{ ...D, fontSize: 52, color: GOLD, marginTop: 34 }}>Takeaway: just keep progressing.</div>
      </div>
      <Source>Plotkin et al., PeerJ, 2022</Source>
    </Frame>
  ),
  // 4. what RPE is
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <Pill bg={GOLD}>What's RPE?</Pill>
        <div style={{ ...H, fontSize: 100, marginTop: 24 }}>How many reps</div>
        <div style={{ ...H, fontSize: 100, color: B.lo }}>were left in the tank</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 560 }}>
        {[[10, "0 reps left", "max effort", RED], [9, "1 rep left", "", "#FF8A5C"], [8, "2 reps left", "", GOLD], [7, "3 reps left", "", GRN], [6, "4+ reps left", "warm-up feel", "rgba(242,240,234,.4)"]].map(([n, a, b, c]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 28, padding: "16px 0", borderBottom: "2px solid rgba(242,240,234,.18)" }}>
            <div style={{ width: 150, ...D, fontSize: 64, color: c, textTransform: "none" }}>RPE {n}</div>
            <div style={{ height: 22, width: (n - 5) * 70, borderRadius: 11, background: c }} />
            <div style={{ ...UI, fontSize: 40, color: PAPER }}>{a}{b && <span style={{ color: "rgba(242,240,234,.55)" }}> · {b}</span>}</div>
          </div>
        ))}
        <div style={{ ...UI, fontSize: 36, color: DIM, marginTop: 26 }}>Bad sleep? Great day? RPE adjusts the weight to how you feel today.</div>
      </div>
      <Source>Zourdos et al., J Strength Cond Res, 2016 (the RPE scale based on reps in reserve)</Source>
    </Frame>
  ),
  // 5. Helms 2018
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <Study who="2018" />
        <div style={{ ...H, fontSize: 92, marginTop: 24 }}>RPE vs a fixed</div>
        <div style={{ ...H, fontSize: 92 }}>% of your max</div>
        <div style={{ ...UI, fontSize: 38, color: DIM, marginTop: 20 }}>21 trained men, 8 weeks of squat and bench. Same sets, same reps. One group picked weights by RPE, the other by % of their max.</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 770 }}>
        <Rows items={["Both groups got stronger", "Small strength edge for RPE", "Muscle growth was similar"]} />
      </div>
      <Source>Helms et al., Frontiers in Physiology, 2018</Source>
    </Frame>
  ),
  // 6. Graham & Cleather 2021
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <Study who="2021" />
        <div style={{ ...H, fontSize: 92, marginTop: 24 }}>12 weeks of squats:</div>
        <div style={{ ...H, fontSize: 92, color: B.lo }}>RPE-style vs fixed</div>
        <div style={{ ...UI, fontSize: 38, color: DIM, marginTop: 20 }}>One group set the weight by reps left in the tank, the other followed fixed percentages. Volume was matched.</div>
      </div>
      {[["Back squat", 10.8, 7.1, 96], ["Front squat", 11.7, 8.3, 600]].map(([l, a, b, x]) => (
        <div key={l} style={{ position: "absolute", left: x, top: 700, width: 366 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 400 }}>
            {[[a, "RPE", true], [b, "Fixed", false]].map(([v, t, hot]) => (
              <div key={t} style={{ width: 170, textAlign: "center" }}>
                <div style={{ ...D, fontSize: 64, color: hot ? GRN : "rgba(242,240,234,.7)", textTransform: "none" }}>+{v}%</div>
                <div style={{ height: v * 26, marginTop: 8, borderRadius: "18px 18px 0 0", background: hot ? `linear-gradient(180deg, ${GRN}, #1E9E6A)` : "rgba(242,240,234,.25)" }} />
                <div style={{ ...D, fontSize: 34, color: PAPER, marginTop: 12 }}>{t}</div>
              </div>
            ))}
          </div>
          <div style={{ ...D, fontSize: 40, color: GOLD, marginTop: 14, textAlign: "center", width: 366 }}>{l}</div>
        </div>
      ))}
      <Source>Graham & Cleather, J Strength Cond Res, 2021 (average 1RM gain)</Source>
    </Frame>
  ),
  // 7. Robinson 2024: how hard to push
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <Study who="2024 review" />
        <div style={{ ...H, fontSize: 92, marginTop: 24 }}>How close to</div>
        <div style={{ ...H, fontSize: 92, color: RED }}>failure?</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 540, display: "flex", flexDirection: "column", gap: 40 }}>
        {[["For muscle", "Growth went up the closer sets got to failure", GRN], ["For strength", "Gains were similar across a wide range. The weight on the bar mattered more", GOLD]].map(([a, b, c]) => (
          <div key={a} style={{ padding: "30px 34px", borderRadius: 26, background: "rgba(7,7,26,.55)", border: `3px solid ${c}` }}>
            <div style={{ ...D, fontSize: 64, color: c }}>{a}</div>
            <div style={{ ...UI, fontSize: 44, color: PAPER, marginTop: 12, lineHeight: 1.2 }}>{b}</div>
          </div>
        ))}
        <div style={{ ...UI, fontSize: 40, color: DIM }}>So: push hard sets close to failure, and keep adding weight over time.</div>
      </div>
      <Source>Robinson et al., Sports Medicine, 2024</Source>
    </Frame>
  ),
  // 8. the problem -> the app
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 180 }}>
        <div style={{ ...H, fontSize: 96 }}>The hard part?</div>
        <div style={{ ...H, fontSize: 96, color: RED }}>Remembering it all</div>
        <div style={{ ...UI, fontSize: 38, color: DIM, marginTop: 20 }}>What did you lift last week? For how many reps? At what RPE?</div>
      </div>
      <Phone src="app/tracker.jpg" w={330} x={676} y={560} rot={5} />
      <div style={{ position: "absolute", left: 64, width: 580, top: 580 }}>
        <div style={{ ...D, fontSize: 44, color: GRN, letterSpacing: "0.04em" }}>Darebni AI does it for you</div>
        <div style={{ marginTop: 22 }}>
          <Rows size={36} items={["A weekly plan with sets, reps, rest & RPE", "Log every set, kg & rep live", "Weekly follow-up on your progress", "PR tracker for your best lifts"]} />
        </div>
      </div>
    </Frame>
  ),
  // 9. CTA
  (k) => (
    <Frame k={k}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 190 }}>
        <div style={{ ...H, fontSize: 110 }}>Stop guessing.</div>
        <div style={{ ...H, fontSize: 110, color: GRN }}>Start progressing.</div>
      </div>
      <Phone src="app/home.jpg" w={330} x={676} y={470} rot={6} />
      <div style={{ position: "absolute", left: 64, width: 560, top: 480 }}>
        <div style={{ ...UI, fontSize: 40, color: PAPER, lineHeight: 1.25 }}>Your plan, with the weights, sets, reps and RPE, built for you and tracked every set.</div>
        <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 28px", borderRadius: 999, background: PAPER }}>
          <span style={{ ...D, fontSize: 40, color: INK }}>Follow</span><span style={{ ...D, fontSize: 40, color: B.primary }}>@darebni_ai</span>
        </div>
        <div style={{ ...UI, fontSize: 32, color: DIM, marginTop: 14 }}>for more tips, studies & workouts</div>
        <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 30px 14px 14px", borderRadius: 26, background: B.primary, border: `3px solid ${B.lo}` }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 84, height: 84, borderRadius: 20 }} />
          <div><div style={{ ...D, fontSize: 28, color: B.xlo, letterSpacing: "0.04em" }}>Download on the App Store</div><div style={{ ...D, fontSize: 60, color: PAPER }}>Darebni AI</div></div>
        </div>
      </div>
    </Frame>
  ),
];

// slide 1 as a 6 s motion piece. Frame 0 is the finished cover (Instagram shows a video slide's first frame in the grid):
// the bars and the gold trend line sink away, the 8 weekly bars climb back one after another, the line redraws and its
// arrow lands, then the swipe arrow nudges right. The last frame matches the first, so the loop is seamless.
export const COV = { DURATION: 180, DROP: 10, DROP_LEN: 16, BAR0: 36, BAR_STEP: 7, LINE: 96, NUDGE: 130 };
export const OverloadCover = ({ sound = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const sp = (at, d = 12, st = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: st } });
  const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const down = interpolate(f, [COV.DROP, COV.DROP + COV.DROP_LEN], [0, 1], { ...cl, easing: (t) => t * t });
  const bar = (i) => f < COV.BAR0 ? 1 - down : sp(COV.BAR0 + i * COV.BAR_STEP, 16, 170);
  const line = f < COV.BAR0 ? 1 - interpolate(f, [COV.DROP, COV.DROP + 8], [0, 1], cl) : interpolate(f, [COV.LINE, COV.LINE + 24], [0, 1], cl);
  const nudge = f > COV.NUDGE ? 10 * Math.max(0, Math.sin((f - COV.NUDGE) / 6)) * (f < COV.DURATION - 12 ? 1 : 0) : 0;
  return (
    <Frame k={0}>
      <CoverTitle />
      <Stairs p={bar} line={line} />
      <Arrow style={{ transform: `translateX(${nudge}px)` }} />
      {sound && <Audio src={staticFile("overload-cover.wav")} />}
    </Frame>
  );
};

export const CarouselOverload = () => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return SLIDES[Math.min(SLIDES.length - 1, f)](f);
};
