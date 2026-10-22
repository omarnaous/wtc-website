// "A full online store. $360. Once." A 7-slide motion carousel (4:5) for Appify's e-commerce website plan.
// Every slide is a seamless 6 s loop (frame 0 is a finished still, every motion is periodic), and all seven share one
// wide canvas: the grid and a glowing UV thread run straight through the slide edges, so a swipe feels continuous.
// Facts are Appify's own (pricing page): premium template, admin panel, hosting included, pay once, no monthly fees;
// plus delivery in under 7 days and 1 month of full support (as stated by Appify).
// Store pages, products and orders shown on the screens are illustrations, labelled "sample".
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { useFonts, clamp, TAU } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevBags } from "./DevBags.jsx";
import { W, H, N, LOOP } from "./timing.js";

const C = { ink: "#0A0913", ink2: "#15122A", line: "rgba(143,114,255,.22)", uv: "#5B2BFF", iris: "#8F72FF", paper: "#F3F1FA", yellow: "#FFD23F", pink: "#FF2D6F", mint: "#3DDC97", mute: "#8A84A3" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.98 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const UIR = { fontFamily: "UIR" };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sin = (ph, k = 1, o = 0) => Math.sin(ph * TAU * k + o);
const fract = (x) => x - Math.floor(x);
const Spark = ({ size, color = C.yellow, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const Wordmark = ({ width, fill = "#fff", spark = C.yellow }) => <svg viewBox={WORDMARK.viewBox} width={width} height={(width * 1167) / 3224}><path d={WORDMARK.letters} fill={fill} /><path d={WORDMARK.spark} fill={spark} /></svg>;
const Check = ({ size = 34, bg = C.uv, fg = "#fff" }) => (
  <div style={{ width: size, height: size, borderRadius: 99, background: bg, display: "grid", placeItems: "center", flex: "none" }}>
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={fg} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
const Eyebrow = ({ children, color = C.iris }) => <div style={{ ...M, fontSize: 26, color, display: "flex", alignItems: "center", gap: 14 }}><Spark size={24} color={color} />{children}</div>;
const Title = ({ a, b, bColor = C.iris, size = 86 }) => (
  <div style={{ ...D, fontSize: size, color: "#fff", marginTop: 26 }}>{a}<br /><span style={{ color: bColor }}>{b}</span></div>
);
const Sample = ({ style }) => <div style={{ position: "absolute", ...M, fontSize: 16, color: "rgba(255,255,255,.4)", ...style }}>Sample screens</div>;

// ── the shared canvas: grid + thread + boundary nodes, drawn in carousel coordinates ──────────────────────────────
const TY = (x) => 1215 + 34 * Math.sin((x / W) * Math.PI * 1.0 + 0.6);           // the thread's height along the carousel
function Canvas({ slide, ph }) {
  const pts = []; for (let x = 0; x <= W * N; x += 20) pts.push(`${x},${TY(x).toFixed(1)}`);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.line} 1.5px, transparent 1.5px)`, backgroundSize: "60px 60px", backgroundPosition: `${-slide * W}px 0`, opacity: 0.3 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${46 + 2 * sin(ph)}%, rgba(91,43,255,.42), transparent 60%)` }} />
      <svg width={W} height={H} viewBox={`${slide * W} 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter></defs>
        <polyline points={pts.join(" ")} fill="none" stroke={C.uv} strokeWidth="10" opacity=".55" filter="url(#glow)" />
        <polyline points={pts.join(" ")} fill="none" stroke={C.iris} strokeWidth="3" />
        <polyline points={pts.join(" ")} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4 36" strokeDashoffset={-ph * 40 * 6} strokeLinecap="round" opacity=".9" />
        {Array.from({ length: N + 1 }, (_, k) => k * W).map((x) => (
          <g key={x}>
            <circle cx={x} cy={TY(x)} r={26 + 6 * sin(ph, 2)} fill={C.uv} opacity=".35" filter="url(#glow)" />
            <circle cx={x} cy={TY(x)} r="11" fill={C.yellow} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
}
function Chrome({ slide }) {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 70 }}><Wordmark width={150} /></div>
      <div style={{ position: "absolute", right: 80, top: 78, ...M, fontSize: 22, color: "rgba(255,255,255,.6)" }}>{String(slide + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</div>
    </>
  );
}
const Swipe = ({ ph, label = "Swipe" }) => (
  <div style={{ position: "absolute", right: 80, top: 1258, display: "flex", alignItems: "center", gap: 12, ...UI, fontSize: 28, color: "#fff" }}>
    {label}
    <svg width="46" height="24" viewBox="0 0 46 24" style={{ transform: `translateX(${8 * Math.max(0, sin(ph, 3))}px)` }}><path d="M2 12 H40 M30 3 L41 12 L30 21" fill="none" stroke={C.yellow} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

// ── 1 · the hook ─────────────────────────────────────────────────────────────────────────────────────────────────
function Hook({ ph }) {
  const chips = ["Premium template", "Admin panel", "Hosting included", "Delivered in under 7 days", "1 month full support"];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>E-commerce website</Eyebrow>
        <div style={{ ...D, fontSize: 104, color: "#fff", marginTop: 26 }}>Your brand's<br />online store.</div>
      </div>
      <div style={{ position: "absolute", left: 66, top: 470, ...D, fontSize: 330, letterSpacing: "-0.06em", lineHeight: 1,
        backgroundImage: `linear-gradient(100deg, #fff 0%, #fff ${30 + 100 * ph - 100}%, ${C.yellow} ${44 + 100 * ph - 100}%, #fff ${58 + 100 * ph - 100}%, #fff ${30 + 100 * ph}%, ${C.yellow} ${44 + 100 * ph}%, #fff ${58 + 100 * ph}%)`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 20px 60px rgba(91,43,255,.55))" }}>$360</div>
      <Spark size={84} style={{ position: "absolute", left: 840, top: 488, transform: `rotate(${ph * 90}deg) scale(${1 + 0.12 * sin(ph, 2)})` }} />
      <div style={{ position: "absolute", left: 80, top: 832, ...D, fontSize: 70 }}>
        <span style={{ color: C.yellow }}>Once.</span> <span style={{ color: "rgba(255,255,255,.75)" }}>Not every month.</span>
      </div>
      <div style={{ position: "absolute", left: 80, top: 960, width: 940, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {chips.map((c, i) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 22px 14px 14px", borderRadius: 99, background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(143,114,255,.45)", ...UI, fontSize: 26, color: "#fff", transform: `translateY(${7 * sin(ph, 1, i * 2.1)}px)` }}>
            <Check size={32} />{c}
          </div>
        ))}
      </div>
      <Swipe ph={ph} />
    </>
  );
}

// ── 2 · the monthly trap ─────────────────────────────────────────────────────────────────────────────────────────
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function Trap({ ph }) {
  const top = 560, bot = 1150, gap = 118, n = 12;            // invoices fall forever: the 12 months pass once per loop
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>The monthly trap</Eyebrow>
        <Title a="Most store platforms" b="bill you every month." bColor={C.pink} size={78} />
      </div>
      {/* them */}
      <div style={{ position: "absolute", left: 80, top: 490, ...M, fontSize: 22, color: "rgba(255,255,255,.55)" }}>Monthly plans</div>
      <div style={{ position: "absolute", left: 80, top: top, width: 430, height: bot - top, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 14%, #000 80%, transparent)" }}>
        {Array.from({ length: n }, (_, i) => {
          const y = fract(i / n + ph) * n * gap - gap;
          const m = MONTHS[i];
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: y, width: 430, height: 96, borderRadius: 18, background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,45,111,.35)", display: "flex", alignItems: "center", padding: "0 22px", gap: 18 }}>
              <div style={{ ...M, fontSize: 22, color: C.pink, width: 62 }}>{m}</div>
              <div style={{ ...UI, fontSize: 28, color: "#fff", flex: 1 }}>Monthly fee</div>
              <div style={{ ...M, fontSize: 18, color: "#fff", background: C.pink, padding: "8px 12px", borderRadius: 8 }}>Due</div>
            </div>
          );
        })}
      </div>
      {/* us */}
      <div style={{ position: "absolute", left: 570, top: 490, display: "flex", alignItems: "center", gap: 12 }}><Wordmark width={110} /><span style={{ ...M, fontSize: 22, color: "rgba(255,255,255,.55)" }}>· once</span></div>
      <div style={{ position: "absolute", left: 570, top: 640 + 10 * sin(ph), width: 430, borderRadius: 24, background: C.paper, padding: "34px 34px 30px", boxShadow: "0 40px 90px rgba(0,0,0,.5), 0 0 70px rgba(91,43,255,.35)", transform: `rotate(${2 * sin(ph, 1, 1)}deg)` }}>
        <div style={{ ...M, fontSize: 18, color: C.mute }}>E-commerce website</div>
        <div style={{ ...D, fontSize: 128, color: C.ink, marginTop: 12 }}>$360</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, ...UI, fontSize: 28, color: C.ink }}><Check size={34} />Paid once</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, ...UI, fontSize: 28, color: C.ink }}><Check size={34} />$0 / month</div>
      </div>
      <div style={{ position: "absolute", left: 570, top: 1040, ...D, fontSize: 46, color: "#fff" }}>One payment.<br /><span style={{ color: C.yellow }}>That's it.</span></div>
      <Swipe ph={ph} />
    </>
  );
}

// ── 3 · the template (a sample store scrolling in a browser) ───────────────────────────────────────────────────────
const TILE = ["#E9E2FF", "#DDF1FF", "#FFE9DC", "#DFF7EA", "#FFF3C9", "#F7DFEF"];
function Product({ k }) {
  const ink = "#2A2440";
  const shapes = [
    <g key="b"><path d="M30 40 H70 L74 82 H26 Z" fill="#5B2BFF" /><path d="M40 40 Q40 26 50 26 Q60 26 60 40" fill="none" stroke={ink} strokeWidth="4" /></g>,
    <g key="o"><rect x="40" y="22" width="20" height="12" rx="3" fill={ink} /><rect x="32" y="34" width="36" height="50" rx="10" fill="#8F72FF" /></g>,
    <g key="s"><path d="M18 70 Q20 52 36 50 L52 56 Q66 62 80 64 Q86 66 84 74 H20 Z" fill="#2A2440" /><path d="M20 74 H84" stroke="#fff" strokeWidth="4" /></g>,
    <g key="t"><path d="M30 30 L42 24 Q50 32 58 24 L70 30 L80 44 L70 50 V82 H30 V50 L20 44 Z" fill="#FF8A5B" /></g>,
    <g key="r"><circle cx="50" cy="58" r="20" fill="none" stroke="#C9A227" strokeWidth="7" /><path d="M42 34 L50 24 L58 34 L50 42 Z" fill="#74C6FF" /></g>,
    <g key="c"><path d="M22 60 Q22 30 50 30 Q78 30 78 60 Z" fill="#3DDC97" /><path d="M14 60 H86" stroke={ink} strokeWidth="5" strokeLinecap="round" /></g>,
  ];
  return <svg viewBox="0 0 100 100" width="100%" height="100%">{shapes[k % 6]}</svg>;
}
function Template({ ph }) {
  const bw = 920, bh = 640, rowH = 300, rows = 4;
  const sy = ph * rowH * 4;                                  // the page repeats every 4 rows and scrolls 4 per loop
  const tap = fract(ph * 2), tapK = Math.max(0, 1 - Math.abs(tap - 0.55) / 0.08);
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>01 · Premium template</Eyebrow>
        <Title a="A store that looks" b="premium on day one." size={78} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 500, width: bw, borderRadius: 24, overflow: "hidden", background: "#17142B", boxShadow: "0 50px 110px rgba(0,0,0,.6), 0 0 0 2px rgba(143,114,255,.4)" }}>
        <div style={{ height: 46, display: "flex", alignItems: "center", gap: 9, padding: "0 18px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
          <div style={{ marginLeft: 220, padding: "5px 40px", borderRadius: 9, background: "rgba(255,255,255,.08)", ...UIR, fontSize: 18, color: "rgba(255,255,255,.8)" }}>yourbrand.com</div>
        </div>
        <div style={{ position: "relative", height: bh, background: "#FBFAFE", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, display: "flex", alignItems: "center", padding: "0 30px", background: "#FBFAFE", zIndex: 2, borderBottom: "1px solid #ECE8F6" }}>
            <div style={{ ...D, fontSize: 30, color: C.ink, letterSpacing: "-0.02em" }}>YOUR BRAND</div>
            <div style={{ display: "flex", gap: 26, marginLeft: 50, ...UI, fontSize: 18, color: "#6B6585" }}><span>New in</span><span>Shop</span><span>About</span></div>
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 8 H19 L18 21 H6 Z" fill="none" stroke={C.ink} strokeWidth="1.8" /><path d="M9 8 V6 Q9 3 12 3 Q15 3 15 6 V8" fill="none" stroke={C.ink} strokeWidth="1.8" /></svg>
              <div style={{ position: "absolute", right: -8, top: -6, width: 22, height: 22, borderRadius: 99, background: C.uv, color: "#fff", ...UI, fontSize: 13, display: "grid", placeItems: "center", transform: `scale(${1 + 0.45 * tapK})` }}>2</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 70 - sy }}>
            {Array.from({ length: rows + 4 }, (_, r) => r % 2 === 0 ? (
              <div key={r} style={{ height: rowH, margin: "0 30px", display: "flex", alignItems: "center" }}>
                <div style={{ width: "100%", height: rowH - 40, borderRadius: 20, background: `linear-gradient(120deg, ${C.uv}, #9D7BFF)`, display: "flex", alignItems: "center", padding: "0 44px" }}>
                  <div><div style={{ ...M, fontSize: 16, color: "rgba(255,255,255,.75)" }}>New collection</div><div style={{ ...D, fontSize: 56, color: "#fff", marginTop: 10 }}>Made to<br />be worn.</div>
                    <div style={{ marginTop: 18, display: "inline-block", padding: "10px 22px", borderRadius: 99, background: "#fff", ...UI, fontSize: 18, color: C.ink }}>Shop now</div></div>
                  <div style={{ marginLeft: "auto", width: 200, height: 200 }}><Product k={r % 4} /></div>
                </div>
              </div>
            ) : (
              <div key={r} style={{ height: rowH, margin: "0 30px", display: "flex", gap: 20 }}>
                {[0, 1, 2].map((c) => (
                  <div key={c} style={{ flex: 1 }}>
                    <div style={{ height: 190, borderRadius: 16, background: TILE[((r % 4) + c) % 6], padding: 24 }}><Product k={(r % 4 === 1 ? 0 : 3) + c} /></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, ...UI, fontSize: 18, color: C.ink }}><span>Product {(r % 4 === 1 ? 0 : 3) + c + 1}</span><span style={{ color: C.uv }}>Add +</span></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* a cursor that taps "Add" */}
          <svg width="40" height="40" viewBox="0 0 24 24" style={{ position: "absolute", zIndex: 3, left: 700 + 120 * sin(ph, 2, 0.4), top: 330 + 90 * sin(ph, 2, 2.2), transform: `scale(${1 - 0.15 * tapK})` }}>
            <path d="M3 2 L20 11 L12 13 L9 21 Z" fill={C.ink} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <Sample style={{ left: 80, top: 1176 }} />
      <Swipe ph={ph} />
    </>
  );
}

// ── 4 · the admin panel ────────────────────────────────────────────────────────────────────────────────────────────
const ORDERS = [["#1048", "Paid", "$64"], ["#1047", "Shipped", "$120"], ["#1046", "Paid", "$38"], ["#1045", "Delivered", "$92"], ["#1044", "Paid", "$55"], ["#1043", "Shipped", "$146"]];
function Admin({ ph }) {
  const rowH = 74, n = ORDERS.length, off = ph * rowH * n;  // the six orders pass once per loop
  const toast = fract(ph * 2), toastK = interpolate(toast, [0.1, 0.18, 0.42, 0.5], [0, 1, 1, 0], clamp);
  const tag = (s) => ({ Paid: [C.mint, "#063"], Shipped: [C.iris, "#fff"], Delivered: ["#74C6FF", "#023"] }[s]);
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>02 · Admin panel</Eyebrow>
        <Title a="Products & orders," b="all in one dashboard." size={78} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 500, width: 920, height: 640, borderRadius: 24, overflow: "hidden", background: "#13112A", border: "2px solid rgba(143,114,255,.35)", boxShadow: "0 50px 110px rgba(0,0,0,.6)", display: "flex" }}>
        <div style={{ width: 200, background: "#0E0C20", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Wordmark width={110} />
          {["Overview", "Orders", "Products", "Customers", "Settings"].map((s, i) => (
            <div key={s} style={{ marginTop: i ? 0 : 22, padding: "12px 14px", borderRadius: 12, background: i === 1 ? "rgba(91,43,255,.35)" : "transparent", ...UI, fontSize: 20, color: i === 1 ? "#fff" : "rgba(255,255,255,.55)" }}>{s}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, position: "relative" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {[["Orders", "128"], ["Products", "46"], ["Customers", "312"]].map(([k, v]) => (
              <div key={k} style={{ flex: 1, padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ ...M, fontSize: 14, color: "rgba(255,255,255,.5)" }}>{k}</div>
                <div style={{ ...D, fontSize: 48, color: "#fff", marginTop: 8 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ ...M, fontSize: 15, color: "rgba(255,255,255,.5)", marginTop: 26 }}>Latest orders</div>
          <div style={{ position: "relative", height: 360, marginTop: 12, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 12%, #000 85%, transparent)" }}>
            {Array.from({ length: 2 * n }, (_, i) => {
              const [id, st, amt] = ORDERS[i % n], y = i * rowH - off, [bg, fg] = tag(st);
              return (
                <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: rowH - 12, borderRadius: 14, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", padding: "0 18px", gap: 18, ...UI, fontSize: 22, color: "#fff" }}>
                  <span style={{ width: 80 }}>{id}</span>
                  <span style={{ ...M, fontSize: 14, padding: "6px 10px", borderRadius: 8, background: bg, color: fg }}>{st}</span>
                  <span style={{ marginLeft: "auto", color: C.yellow }}>{amt}</span>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", right: 24, top: 20, display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 16, background: C.paper, ...UI, fontSize: 21, color: C.ink, boxShadow: "0 20px 40px rgba(0,0,0,.45)", opacity: toastK, transform: `translateY(${(1 - toastK) * -30}px) scale(${0.9 + 0.1 * toastK})` }}>
            <Check size={30} bg={C.mint} fg="#063" /> New order · $64
          </div>
        </div>
      </div>
      <Sample style={{ left: 80, top: 1176 }} />
      <Swipe ph={ph} />
    </>
  );
}

// ── 5 · hosting included ──────────────────────────────────────────────────────────────────────────────────────────
function Hosting({ ph }) {
  const R = 230, cx = 540, cy = 790, rot = ph * TAU;
  const ring = fract(ph * 2);
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>03 · Hosting included</Eyebrow>
        <Title a="Hosting? Included." b="No separate bill." size={78} />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs><radialGradient id="globe" cx="40%" cy="35%"><stop offset="0" stopColor="#7E5CFF" /><stop offset="1" stopColor="#2A0FA0" /></radialGradient></defs>
        <circle cx={cx} cy={cy} r={R + 40 + 120 * ring} fill="none" stroke={C.iris} strokeWidth="3" opacity={0.6 * (1 - ring)} />
        <circle cx={cx} cy={cy} r={R} fill="url(#globe)" />
        {[0, 1, 2, 3, 4, 5].map((k) => {                        // meridians turning: 6 per half-turn, so the loop is seamless
          const a = rot / 6 + (k * Math.PI) / 6, rx = Math.abs(Math.cos(a)) * R;
          return <ellipse key={k} cx={cx} cy={cy} rx={rx} ry={R} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2.5" />;
        })}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((k) => <ellipse key={k} cx={cx} cy={cy + k * R} rx={Math.sqrt(1 - k * k) * R} ry={Math.sqrt(1 - k * k) * R * 0.18} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" />)}
        {[0, 1, 2].map((k) => {
          const a = rot + (k * TAU) / 3, x = cx + Math.cos(a) * (R + 70), y = cy + Math.sin(a) * (R + 70) * 0.32;
          return <circle key={k} cx={x} cy={y} r="11" fill={C.yellow} opacity={Math.sin(a) > -0.2 ? 1 : 0.35} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 26px", borderRadius: 99, background: C.paper, ...UI, fontSize: 28, color: C.ink }}>
          <span style={{ width: 16, height: 16, borderRadius: 99, background: C.mint, boxShadow: `0 0 0 ${6 + 6 * Math.max(0, sin(ph, 4))}px rgba(61,220,151,.3)` }} />Your store · online
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 26px", borderRadius: 99, background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(143,114,255,.5)", ...UI, fontSize: 28, color: "#fff" }}><Check size={30} />Hosting included</div>
      </div>
      <Swipe ph={ph} />
    </>
  );
}

// ── 6 · pay once: the receipt and its stamp ─────────────────────────────────────────────────────────────────────────
function PayOnce({ ph, f }) {
  // the stamp is down at frame 0; it lifts at 70% of the loop and slams back at 84%
  const up = interpolate(ph, [0.7, 0.78, 0.84], [0, 1, 0], clamp);
  const slam = spring({ frame: f - Math.round(0.84 * LOOP), fps: 30, config: { damping: 9, stiffness: 300 } });
  const hit = ph >= 0.84 ? 1 + 0.25 * (1 - Math.min(1, slam)) : 1;
  const lines = [["Premium template", "✓"], ["Admin panel", "✓"], ["Hosting", "✓"], ["Delivery", "Under 7 days"], ["Full support", "1 month"], ["Monthly fees", "$0"]];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>04 · Pay once</Eyebrow>
        <Title a="$360. Once." b="No monthly fees." bColor={C.yellow} size={86} />
      </div>
      <div style={{ position: "absolute", left: 190, top: 450, width: 700, transform: `rotate(${-1.5 + 0.6 * sin(ph)}deg) translateY(${6 * sin(ph, 1, 1)}px)` }}>
        <div style={{ background: C.paper, borderRadius: "22px 22px 0 0", padding: "40px 48px 34px", boxShadow: "0 50px 110px rgba(0,0,0,.6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Wordmark width={140} fill={C.ink} spark={C.uv} /><span style={{ ...M, fontSize: 16, color: C.mute }}>Receipt</span></div>
          <div style={{ ...UI, fontSize: 30, color: C.ink, marginTop: 30 }}>E-commerce website · Standard</div>
          <div style={{ borderTop: "2px dashed #CFCAE0", marginTop: 22 }} />
          {lines.map(([a, b]) => (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", marginTop: 13, ...UIR, fontSize: 27, color: "#3A3550" }}><span>{a}</span><span style={{ ...UI, color: b === "$0" ? C.uv : C.ink }}>{b}</span></div>
          ))}
          <div style={{ borderTop: "2px dashed #CFCAE0", marginTop: 26 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 20 }}>
            <span style={{ ...M, fontSize: 18, color: C.mute }}>Total · pay once</span><span style={{ ...D, fontSize: 92, color: C.ink, marginTop: 6 }}>$360</span>
          </div>
        </div>
        <svg width="700" height="28" viewBox="0 0 700 28" style={{ display: "block" }}><path d={`M0 0 H700 V8 ${Array.from({ length: 25 }, (_, i) => `L${700 - i * 28 - 14} 26 L${700 - (i + 1) * 28} 8`).join(" ")} Z`} fill={C.paper} /></svg>
        <div style={{ position: "absolute", left: 40, top: 505, padding: "14px 26px", border: `7px solid ${C.uv}`, borderRadius: 14, ...M, fontWeight: 600, fontSize: 46, letterSpacing: "0.1em", color: C.uv, opacity: 0.92 * (1 - up), transform: `rotate(-9deg) translateY(${-160 * up}px) scale(${(1 + 0.4 * up) * hit})` }}>Paid once</div>
      </div>
      <Swipe ph={ph} />
    </>
  );
}

// ── 7 · the DM ────────────────────────────────────────────────────────────────────────────────────────────────────
function Cta({ ph }) {
  const t = ph * TAU * 2;
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 200 }}>
        <Eyebrow>Your store, live</Eyebrow>
        <div style={{ ...D, fontSize: 96, color: "#fff", marginTop: 26 }}>Ready to<br />sell online?</div>
        <div style={{ ...UI, fontSize: 32, color: "rgba(255,255,255,.75)", marginTop: 28, lineHeight: 1.35 }}>E-commerce website · <span style={{ color: C.yellow }}>$360</span><br />Pay once · hosting included<br />Delivered in under 7 days<br />1 month full support</div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 850, transform: `scale(${1 + 0.03 * Math.max(0, sin(ph, 2))})`, transformOrigin: "0% 50%" }}>
        <div style={{ padding: "22px 36px", borderRadius: 26, background: C.yellow, boxShadow: "0 20px 60px rgba(255,210,63,.3)" }}>
          <div style={{ ...M, fontSize: 22, color: C.ink }}>DM us</div>
          <div style={{ ...D, fontSize: 60, color: C.ink, marginTop: 6 }}>“ECOMMERCE”</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1065, ...M, fontSize: 22, color: "rgba(255,255,255,.7)", lineHeight: 1.8 }}>appify-lb.com<br />@appifylb</div>
      <div style={{ position: "absolute", left: 640, top: 480 }}>
        <DevBags width={360} t={t} tilt={2.5 * sin(ph, 2)} bob={3 * sin(ph, 3)} face={{ brow: 16, lid: fract(ph * 2) > 0.94 ? 1 : 0.05, smile: 1, look: -8, happy: 1 }} />
      </div>
    </>
  );
}

const SLIDES = [Hook, Trap, Template, Admin, Hosting, PayOnce, Cta];
export const Slide = ({ slide = 0 }) => {
  const f = useCurrentFrame(), ph = (f % LOOP) / LOOP;
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const S = SLIDES[slide];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Canvas slide={slide} ph={ph} />
      <S ph={ph} f={f % LOOP} />
      <Chrome slide={slide} />
    </AbsoluteFill>
  );
};
