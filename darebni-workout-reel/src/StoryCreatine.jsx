// "Story time" reel: what the science says about creatine. Every number is from a real source:
// - Rawson & Volek (2003), J Strength Cond Res 17(4):822-831, a review of 22 studies of creatine + resistance training:
//   strength (1/3/10RM) rose 20% with creatine vs 12% with placebo; weightlifting performance (max reps at a given %
//   of max) rose 14% more with creatine; "the response is highly variable".
// - Kreider et al. (2017), ISSN position stand, J Int Soc Sports Nutr 14:18: up to 30 g/day for 5 years safe and well
//   tolerated in healthy people; no compelling evidence of harm to kidney function; 3-5 g/day to keep stores up.
// No footage: kinetic type, a paper card, a stack of 22 studies and two animated bar charts. 30 s.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR } from "./Main.jsx";

const FPS = 30;
export const SC = { FPS, HOOK: 0, PAPER: 96, STR: 228, REPS: 384, TWIST: 498, SAFE: 594, DOSE: 714, END: 804, DURATION: 924 };
const T = SC;
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 50) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const win = (f, a, b, fi = 6, fo = 6) => interpolate(f, [a - fi, a, b - fo, b], [0, 1, 1, 0], clamp);
const H = { ...D, color: B.cream };
const Tag = ({ children, color = B.xlo, style }) => <div style={{ ...D, fontSize: 32, letterSpacing: "0.14em", color, ...style }}>{children}</div>;
const Cite = ({ f, at, children }) => <div style={{ position: "absolute", left: 70, right: 70, top: 1430, ...UIR, fontSize: 28, color: "rgba(242,240,234,.6)", ...rise(sp(f, at)) }}>{children}</div>;

function Scene({ f, a, b, children }) {
  if (f < a - 6 || f > b + 2) return null;
  const o = win(f, a, b, 0.01, 8), x = interpolate(f, [b - 8, b], [0, -60], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateX(${x}px)` }}>{children}</AbsoluteFill>;
}

function Hook({ f }) {
  return (
    <Scene f={f} a={T.HOOK} b={T.PAPER}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 470 }}>
        <div style={{ display: "inline-block", padding: "12px 22px", borderRadius: 14, background: B.primary, ...rise(sp(f, 2)) }}><Tag color={B.cream}>Story time</Tag></div>
        <div style={{ ...H, fontSize: 150, marginTop: 34, ...rise(sp(f, 8, 12, 240), 60) }}>Does creatine</div>
        <div style={{ ...H, fontSize: 150, color: B.lo, ...rise(sp(f, 16, 12, 240), 60) }}>actually work?</div>
        <div style={{ ...UI, fontSize: 46, color: "rgba(242,240,234,.85)", marginTop: 34, ...rise(sp(f, 40)) }}>Scientists checked 22 studies.</div>
      </div>
    </Scene>
  );
}

function Paper({ f }) {
  const t = f - T.PAPER, n = Math.min(22, Math.max(0, Math.floor((t - 20) / 2.2)));
  return (
    <Scene f={f} a={T.PAPER} b={T.STR}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <Tag style={rise(sp(f, T.PAPER + 2))}>2003 · the review</Tag>
        <div style={{ ...H, fontSize: 96, marginTop: 14, whiteSpace: "nowrap", ...rise(sp(f, T.PAPER + 6, 12, 240), 50) }}>They pulled every study</div>
        <div style={{ ...H, fontSize: 96, color: B.lo, ...rise(sp(f, T.PAPER + 12, 12, 240), 50) }}>they could find.</div>
      </div>
      {/* the stack of studies */}
      <div style={{ position: "absolute", left: 70, top: 660, width: 940, height: 560 }}>
        {Array.from({ length: n }, (_, i) => {
          const p = sp(f, T.PAPER + 20 + i * 2.2, 14, 260);
          return <div key={i} style={{ position: "absolute", left: 40 + (i % 11) * 76, top: Math.floor(i / 11) * 250 + (1 - Math.min(1, p)) * -80, width: 64, height: 210, borderRadius: 10,
            background: "linear-gradient(180deg, #F2F0EA, #D9D5F5)", boxShadow: "0 10px 26px rgba(0,0,0,.45)", opacity: Math.min(1, p * 2) }}>
            {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ margin: `${k ? 12 : 20}px 10px 0`, height: 7, borderRadius: 4, background: k ? "rgba(7,7,26,.22)" : B.primary }} />)}
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", right: 70, top: 1170, textAlign: "right", display: "flex", alignItems: "baseline", gap: 18 }}>
        <div style={{ ...H, fontSize: 180, color: B.cream, lineHeight: 0.85 }}>{n}</div>
        <Tag>studies</Tag>
      </div>
      <Cite f={f} at={T.PAPER + 30}>Rawson & Volek, Journal of Strength and Conditioning Research, 2003</Cite>
    </Scene>
  );
}

// two bars racing up; numbers count with them
function Bars({ f, at, label, a, b, unit = "%", note }) {
  const p = interpolate(f, [at + 24, at + 64], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const max = Math.max(a.v, b.v) * 1.15, H0 = 560;
  const bar = (x, v, name, hot, delay) => {
    const q = interpolate(f, [at + 24 + delay, at + 64 + delay], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 }), h = (v / max) * H0 * q;
    return (
      <div style={{ position: "absolute", left: x, bottom: 0, width: 360 }}>
        <div style={{ ...H, fontSize: 120, color: hot ? B.lo : "rgba(242,240,234,.7)", textAlign: "center", marginBottom: 14 }}>+{Math.round(v * q)}{unit}</div>
        <div style={{ height: h, borderRadius: "22px 22px 0 0", background: hot ? `linear-gradient(180deg, ${B.lo}, ${B.primary})` : "rgba(242,240,234,.22)",
          boxShadow: hot ? "0 0 60px rgba(139,128,255,.5)" : "none" }} />
        <div style={{ ...UI, fontSize: 36, color: B.cream, textAlign: "center", marginTop: 18, lineHeight: 1.2 }}>{name}</div>
      </div>
    );
  };
  return (
    <>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1460 - 100 - 40, height: 2, background: "rgba(242,240,234,.25)" }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 640, height: 680 }}>
        {bar(0, a.v, a.name, false, 0)}
        {bar(440, b.v, b.name, true, 8)}
      </div>
      {note && <div style={{ position: "absolute", left: 70, right: 70, top: 1300, ...UI, fontSize: 34, color: "rgba(242,240,234,.75)", textAlign: "center", opacity: p }}>{note}</div>}
    </>
  );
}

function Strength({ f }) {
  return (
    <Scene f={f} a={T.STR} b={T.REPS}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <Tag style={rise(sp(f, T.STR + 2))}>Result 1 · strength</Tag>
        <div style={{ ...H, fontSize: 100, marginTop: 14, ...rise(sp(f, T.STR + 6, 12, 240), 50) }}>Same training.</div>
        <div style={{ ...H, fontSize: 100, color: B.lo, ...rise(sp(f, T.STR + 12, 12, 240), 50) }}>Different results.</div>
      </div>
      <Bars f={f} at={T.STR} a={{ v: 12, name: "Placebo + training" }} b={{ v: 20, name: "Creatine + training" }} />
      <Cite f={f} at={T.STR + 60}>Average strength gain (1, 3 or 10-rep max) across 22 studies</Cite>
    </Scene>
  );
}

function Reps({ f }) {
  const p = sp(f, T.REPS + 14, 10, 220);
  return (
    <Scene f={f} a={T.REPS} b={T.TWIST}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <Tag style={rise(sp(f, T.REPS + 2))}>Result 2 · reps</Tag>
        <div style={{ ...H, fontSize: 100, marginTop: 14, ...rise(sp(f, T.REPS + 6, 12, 240), 50) }}>More reps</div>
        <div style={{ ...H, fontSize: 100, color: B.lo, ...rise(sp(f, T.REPS + 12, 12, 240), 50) }}>at the same weight.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center" }}>
        <div style={{ ...H, fontSize: 360, color: B.lo, lineHeight: 0.9, textShadow: "0 0 80px rgba(139,128,255,.5)", transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`, opacity: Math.min(1, p * 2) }}>
          +{Math.round(14 * Math.min(1, interpolate(f, [T.REPS + 14, T.REPS + 44], [0, 1], clamp)))}%
        </div>
        <div style={{ ...UI, fontSize: 44, color: B.cream, marginTop: 20, ...rise(sp(f, T.REPS + 30)) }}>bigger improvement than placebo</div>
      </div>
      <Cite f={f} at={T.REPS + 40}>Max reps at a given % of max strength · Rawson & Volek, 2003</Cite>
    </Scene>
  );
}

function Twist({ f }) {
  return (
    <Scene f={f} a={T.TWIST} b={T.SAFE}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 560 }}>
        <Tag color={B.danger} style={rise(sp(f, T.TWIST + 2))}>Plot twist</Tag>
        <div style={{ ...H, fontSize: 124, marginTop: 18, ...rise(sp(f, T.TWIST + 6, 12, 240), 50) }}>It doesn’t work</div>
        <div style={{ ...H, fontSize: 124, color: B.lo, ...rise(sp(f, T.TWIST + 12, 12, 240), 50) }}>the same for everyone.</div>
        <div style={{ ...UI, fontSize: 42, color: "rgba(242,240,234,.85)", marginTop: 30, ...rise(sp(f, T.TWIST + 34)) }}>The authors: “the response is highly variable.”</div>
      </div>
    </Scene>
  );
}

function Safe({ f }) {
  const items = [["Up to 30 g a day for 5 years", "safe and well tolerated in healthy people"], ["No compelling evidence", "that it harms healthy kidneys"]];
  return (
    <Scene f={f} a={T.SAFE} b={T.DOSE}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <Tag style={rise(sp(f, T.SAFE + 2))}>But is it safe?</Tag>
        <div style={{ ...H, fontSize: 104, marginTop: 14, ...rise(sp(f, T.SAFE + 6, 12, 240), 50) }}>The sports nutrition</div>
        <div style={{ ...H, fontSize: 104, color: B.lo, ...rise(sp(f, T.SAFE + 12, 12, 240), 50) }}>experts answered.</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 760, display: "flex", flexDirection: "column", gap: 46 }}>
        {items.map(([a, b], i) => (
          <div key={a} style={{ display: "flex", gap: 22, alignItems: "flex-start", ...rise(sp(f, T.SAFE + 30 + i * 24), 40) }}>
            <div style={{ flex: "none", width: 64, height: 64, borderRadius: 18, background: B.success, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="38" height="38" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={B.ink} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ ...H, fontSize: 62 }}>{a}</div>
              <div style={{ ...UI, fontSize: 38, color: B.xlo, marginTop: 6 }}>{b}</div>
            </div>
          </div>
        ))}
      </div>
      <Cite f={f} at={T.SAFE + 50}>International Society of Sports Nutrition position stand, Kreider et al., 2017</Cite>
    </Scene>
  );
}

function Dose({ f }) {
  const p = sp(f, T.DOSE + 10, 10, 220);
  return (
    <Scene f={f} a={T.DOSE} b={T.END}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <Tag style={rise(sp(f, T.DOSE + 2))}>So how much?</Tag>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center" }}>
        <div style={{ ...H, fontSize: 300, textTransform: "none", color: B.lo, lineHeight: 0.9, transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`, opacity: Math.min(1, p * 2) }}>3–5 g</div>
        <div style={{ ...H, fontSize: 110, marginTop: 20, ...rise(sp(f, T.DOSE + 22)) }}>a day.</div>
        <div style={{ ...UI, fontSize: 44, color: "rgba(242,240,234,.85)", marginTop: 24, ...rise(sp(f, T.DOSE + 34)) }}>Every day, alongside your training.</div>
      </div>
      <Cite f={f} at={T.DOSE + 40}>ISSN, 2017 · Talk to a doctor first if you have a kidney condition.</Cite>
    </Scene>
  );
}

function End({ f }) {
  if (f < T.END - 2) return null;
  const t = f - T.END, cta = sp(f, T.END + 30, 9, 260);
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [T.END - 2, T.END + 4], [0, 1], clamp) }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 420 }}>
        <div style={{ ...H, fontSize: 124, ...rise(sp(f, T.END + 2, 12, 240), 60) }}>Creatine helps.</div>
        <div style={{ ...H, fontSize: 124, color: B.lo, ...rise(sp(f, T.END + 10, 12, 240), 60) }}>Your plan does</div>
        <div style={{ ...H, fontSize: 124, color: B.lo, ...rise(sp(f, T.END + 14, 12, 240), 60) }}>the work.</div>
        <div style={{ ...UI, fontSize: 42, color: "rgba(242,240,234,.85)", marginTop: 34, ...rise(sp(f, T.END + 24)) }}>Weights, sets & reps built for you, every set tracked.</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1180, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 16px", borderRadius: 26, background: B.cream, boxShadow: "0 24px 60px rgba(91,78,229,.45)",
          transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - 60) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
          <div>
            <div style={{ ...D, fontSize: 30, color: B.primary, letterSpacing: "0.06em" }}>Download now</div>
            <div style={{ ...D, fontSize: 68, color: B.ink }}>Darebni AI</div>
          </div>
        </div>
        <div style={{ ...UI, fontSize: 32, lineHeight: 1.25, color: "rgba(242,240,234,.85)", ...rise(sp(f, T.END + 42)) }}>On the<br />App Store</div>
      </div>
    </AbsoluteFill>
  );
}

export const StoryCreatine = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const cuts = [T.PAPER, T.STR, T.REPS, T.TWIST, T.SAFE, T.DOSE, T.END];
  const flash = cuts.map((c) => interpolate(f, [c - 1, c, c + 6], [0, 0.25, 0], clamp)).reduce((a, b) => a + b, 0);
  const drift = Math.sin(f / 60) * 60;
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + drift / 20}% ${55 + drift / 30}%, rgba(91,78,229,.35), transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${f * 0.4}px` }} />
      <div style={{ position: "absolute", left: 70, top: 228, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 34, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
      <Hook f={f} /><Paper f={f} /><Strength f={f} /><Reps f={f} /><Twist f={f} /><Safe f={f} /><Dose f={f} /><End f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: flash, mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.04} />
      <Audio src={staticFile(music ? "creatine.wav" : "creatine-sfx.wav")} />
    </AbsoluteFill>
  );
};
