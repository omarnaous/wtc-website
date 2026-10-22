// "Your stock lives in a notebook." A 9-slide carousel (4:5 photos) for Appify's web app plan (from $500, pay once):
// the pain of tracking stock by notebook, sheet, chats and memory, then one system that updates stock by itself, alerts
// on low stock and shows the day on one screen. Same canvas, thread and type as the $360 store carousel.
// Plan facts are Appify's own (business systems, automations & workflows, custom dashboards, admin panel, hosting
// included, pay once). Products, numbers and orders are illustrations, labelled "sample".
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useFonts } from "./fx.jsx";
import { Dev } from "./Dev.jsx";
import { C, D, UI, UIR, M, Wordmark, Eyebrow, Title, Sample, Canvas, Chrome, Swipe } from "./Carousel.jsx";
import { LOOP } from "./timing.js";

export const INV_N = 9;
const INK = "#0A0913", SKIN = "#E3AE86";
const card = (extra) => ({ position: "absolute", borderRadius: 24, background: C.paper, boxShadow: "0 40px 90px rgba(0,0,0,.55)", ...extra });
const Bubble = ({ me, children, style }) => (
  <div style={{ position: "absolute", maxWidth: 560, padding: "22px 28px", borderRadius: 30, borderBottomLeftRadius: me ? 30 : 8, borderBottomRightRadius: me ? 8 : 30, background: me ? C.uv : C.paper, color: me ? "#fff" : C.ink, ...UI, fontSize: 36, boxShadow: "0 24px 50px rgba(0,0,0,.4)", ...style }}>{children}</div>
);
const Pill = ({ bg, fg, children }) => <span style={{ ...M, fontSize: 15, padding: "7px 12px", borderRadius: 8, background: bg, color: fg, whiteSpace: "nowrap" }}>{children}</span>;
const STATUS = { in: [C.mint, "#063", "In stock"], low: [C.yellow, INK, "Low stock"], out: [C.pink, "#fff", "Out of stock"] };

// Dev holding an open, scribbled notebook (drawn in Dev's coordinates over the hands-in-front pose)
function DevNotebook({ width = 380, face }) {
  const h = (width * 830) / 420;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} {...face} /></div>
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform="rotate(-6 300 680)">
          <path d="M150 600 L298 616 L298 760 L156 740 Z" fill="#FFF8E7" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
          <path d="M302 616 L450 600 L444 740 L302 760 Z" fill="#FFF3D6" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M172 ${640 + k * 22} L282 ${652 + k * 22}`} stroke="#9AB8E8" strokeWidth="3" />)}
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M318 ${652 + k * 22} L428 ${640 + k * 22}`} stroke="#9AB8E8" strokeWidth="3" />)}
          <path d="M180 646 q12 -10 24 0 t24 0 t24 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M180 690 q10 -8 20 0 t20 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M330 650 l60 -6 M330 676 q14 -10 28 0 t28 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M336 700 l80 -10 M340 690 l70 18" stroke={C.pink} strokeWidth="5" strokeLinecap="round" />
          <text x="372" y="728" fontFamily="Display" fontWeight="600" fontSize="30" fill={C.pink} textAnchor="middle">??</text>
          {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx="300" cy={628 + k * 22} r="6" fill="none" stroke={INK} strokeWidth="4" />)}
        </g>
        <circle cx="204" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
        <circle cx="396" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
      </svg>
    </div>
  );
}

// ── 1 · the hook ─────────────────────────────────────────────────────────────────────────────────────────────────
function Hook() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>Still tracking stock by hand?</Eyebrow>
        <div style={{ ...D, fontSize: 104, color: "#fff", marginTop: 26 }}>Your stock lives<br />in a <span style={{ color: C.yellow }}>notebook.</span></div>
      </div>
      <Bubble style={{ left: 80, top: 520 }}>How many do you<br />have left in M? 👀</Bubble>
      <Bubble me style={{ left: 120, top: 720 }}>Let me check…</Bubble>
      <div style={{ position: "absolute", left: 140, top: 852, display: "flex", gap: 10 }}>
        {[0, 1, 2].map((k) => <i key={k} style={{ width: 16, height: 16, borderRadius: 99, background: "rgba(255,255,255,.55)" }} />)}
      </div>
      <div style={{ position: "absolute", left: 80, top: 930, ...M, fontSize: 22, color: "rgba(255,255,255,.55)" }}>Seen · 2 hours ago</div>
      <div style={{ position: "absolute", left: 650, top: 500 }}>
        <DevNotebook width={360} face={{ brow: 26, lid: 0.05, smile: 0, open: 0.35, look: 8 }} />
      </div>
      <Swipe ph={0} />
    </>
  );
}

// ── 2 · four places for one order ─────────────────────────────────────────────────────────────────────────────────
function Places() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>The mess</Eyebrow>
        <Title a="One order." b="Four places to check." bColor={C.pink} size={86} />
      </div>
      {/* tangled lines to the order in the middle */}
      <svg width="1080" height="1350" style={{ position: "absolute", inset: 0 }}>
        {[[290, 600], [790, 600], [290, 1000], [790, 1000]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y} C ${x + (i % 2 ? -260 : 260)} ${y + (i < 2 ? 260 : -260)}, ${540 + (i % 2 ? 180 : -180)} ${800 + (i < 2 ? -120 : 120)}, 540 800`} fill="none" stroke={C.pink} strokeWidth="4" strokeDasharray="10 12" opacity=".8" />
        ))}
      </svg>
      <div style={card({ left: 90, top: 480, width: 400, padding: "24px 26px", transform: "rotate(-5deg)", background: "#FFF8E7" })}>
        <div style={{ ...M, fontSize: 18, color: C.mute }}>📒 Notebook</div>
        <div style={{ fontFamily: "UIR", fontSize: 28, color: INK, marginTop: 12, lineHeight: 1.4 }}>Black tee M — <s>4</s> 3?<br />Beige set — ask Rita</div>
      </div>
      <div style={card({ left: 590, top: 470, width: 400, padding: "22px 24px", transform: "rotate(4deg)" })}>
        <div style={{ ...M, fontSize: 18, color: C.mute }}>📊 stock_FINAL_v3.xlsx</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", marginTop: 12, border: "1px solid #CFCAE0" }}>
          {["Black tee M", "3", "Beige set", "#REF!", "Cap", "?"].map((t, i) => <div key={i} style={{ padding: "8px 10px", borderRight: i % 2 ? "none" : "1px solid #CFCAE0", borderBottom: "1px solid #CFCAE0", fontFamily: "UIR", fontSize: 22, color: t === "#REF!" ? C.pink : INK }}>{t}</div>)}
        </div>
      </div>
      <div style={card({ left: 100, top: 900, width: 400, padding: "22px 24px", transform: "rotate(3deg)" })}>
        <div style={{ ...M, fontSize: 18, color: C.mute }}>💬 Chats</div>
        <div style={{ marginTop: 12, display: "inline-block", padding: "12px 18px", borderRadius: 18, background: "#E6E1F5", fontFamily: "UIR", fontSize: 24, color: INK }}>still have the black tee in M?</div>
        <div style={{ marginTop: 10, marginLeft: 120, display: "inline-block", padding: "12px 18px", borderRadius: 18, background: C.uv, fontFamily: "UIR", fontSize: 24, color: "#fff" }}>I think so 🙏</div>
      </div>
      <div style={card({ left: 600, top: 920, width: 380, padding: "22px 24px", transform: "rotate(-4deg)", background: "#EDE8FF" })}>
        <div style={{ ...M, fontSize: 18, color: C.mute }}>🧠 Your memory</div>
        <div style={{ ...D, fontSize: 40, color: INK, marginTop: 12 }}>"I think 2 left…<br />or was it 1?"</div>
      </div>
      <div style={{ position: "absolute", left: 420, top: 755, width: 240, padding: "16px 0", borderRadius: 99, background: C.pink, textAlign: "center", ...UI, fontSize: 30, color: "#fff", boxShadow: "0 0 60px rgba(255,45,111,.5)" }}>1 new order</div>
      <Swipe ph={0} />
    </>
  );
}

// ── 3 · sold twice ───────────────────────────────────────────────────────────────────────────────────────────────
function Twice() {
  const order = (label, from, x, rot) => (
    <div style={card({ left: x, top: 520, width: 400, padding: "24px 26px", transform: `rotate(${rot}deg)` })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...M, fontSize: 18, color: C.mute }}>{from}</span><Pill bg={C.mint} fg="#063">Paid</Pill></div>
      <div style={{ ...D, fontSize: 44, color: INK, marginTop: 14 }}>{label}</div>
      <div style={{ fontFamily: "UIR", fontSize: 24, color: "#3A3550", marginTop: 8 }}>Black tee · size M · ×1</div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>It happens</Eyebrow>
        <Title a="You sold it twice." b="You only had one." bColor={C.pink} size={90} />
      </div>
      {order("Order A", "From Instagram", 70, -4)}
      {order("Order B", "In the shop", 610, 4)}
      <svg width="1080" height="1350" style={{ position: "absolute", inset: 0 }}>
        <path d="M270 760 Q300 860 470 900" fill="none" stroke={C.pink} strokeWidth="6" strokeLinecap="round" /><path d="M450 880 L474 902 L444 912" fill="none" stroke={C.pink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M810 760 Q780 860 610 900" fill="none" stroke={C.pink} strokeWidth="6" strokeLinecap="round" /><path d="M630 880 L606 902 L636 912" fill="none" stroke={C.pink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={card({ left: 310, top: 860, width: 460, padding: "26px 28px", border: `4px solid ${C.pink}` })}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 96, height: 96, borderRadius: 18, background: "#E9E2FF", display: "grid", placeItems: "center" }}>
            <svg width="70" height="70" viewBox="0 0 100 100"><path d="M30 30 L42 24 Q50 32 58 24 L70 30 L80 44 L70 50 V82 H30 V50 L20 44 Z" fill={INK} /></svg>
          </div>
          <div><div style={{ ...UI, fontSize: 30, color: INK }}>Black tee · M</div><div style={{ ...M, fontSize: 18, color: C.mute, marginTop: 8 }}>In stock: 1</div></div>
        </div>
        <div style={{ marginTop: 18, padding: "12px 0", borderRadius: 14, background: C.pink, textAlign: "center", ...UI, fontSize: 28, color: "#fff" }}>2 orders · 1 piece 😬</div>
      </div>
      <Swipe ph={0} />
    </>
  );
}

// ── 4 · every Friday ─────────────────────────────────────────────────────────────────────────────────────────────
function Fridays() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow color={C.pink}>The weekly ritual</Eyebrow>
        <Title a="Every Friday, you" b="count everything again." bColor={C.pink} size={80} />
      </div>
      <div style={card({ left: 80, top: 480, width: 920, padding: "30px 32px 34px", background: "#13112A", border: "2px solid rgba(143,114,255,.35)" })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...D, fontSize: 40, color: "#fff" }}>This month</span><span style={{ ...M, fontSize: 18, color: "rgba(255,255,255,.5)" }}>4 × stock count</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginTop: 24 }}>
          {days.map((d, i) => <div key={i} style={{ ...M, fontSize: 18, textAlign: "center", color: i === 4 ? C.pink : "rgba(255,255,255,.5)" }}>{d}</div>)}
          {Array.from({ length: 28 }, (_, i) => {
            const fri = i % 7 === 4;
            return (
              <div key={i} style={{ height: 96, borderRadius: 14, background: fri ? "rgba(255,45,111,.22)" : "rgba(255,255,255,.05)", border: `2px solid ${fri ? C.pink : "transparent"}`, padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ ...UI, fontSize: 20, color: fri ? "#fff" : "rgba(255,255,255,.55)" }}>{i + 1}</span>
                {fri && <span style={{ ...M, fontSize: 12, color: "#fff", lineHeight: 1.2 }}>Count<br />stock</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1098, ...D, fontSize: 48, color: "#fff" }}>Hours gone. <span style={{ color: C.pink }}>Every week.</span></div>
      <Swipe ph={0} />
    </>
  );
}

// ── 5 · the flip ─────────────────────────────────────────────────────────────────────────────────────────────────
const ROWS = [["Black tee", "M", 12, "in"], ["Beige set", "S", 3, "low"], ["Linen shirt", "L", 8, "in"], ["Cap", "One size", 0, "out"], ["Tote bag", "—", 21, "in"]];
function Flip() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>The fix</Eyebrow>
        <Title a="One system." b="Stock updates itself." bColor={C.yellow} size={90} />
      </div>
      <div style={card({ left: 70, top: 500, width: 360, height: 420, padding: "26px", transform: "rotate(-8deg)", background: "#FFF8E7", opacity: 0.5, filter: "grayscale(.6)" })}>
        <div style={{ ...M, fontSize: 16, color: C.mute }}>📒 old notebook</div>
        <div style={{ fontFamily: "UIR", fontSize: 26, color: INK, marginTop: 14, lineHeight: 1.6 }}><s>Black tee M — 3?</s><br /><s>Beige set — ask</s><br /><s>Cap — ??</s></div>
      </div>
      <div style={card({ left: 250, top: 540, width: 760, padding: "26px 28px", background: "#13112A", border: "2px solid rgba(143,114,255,.45)", boxShadow: "0 50px 110px rgba(0,0,0,.6), 0 0 80px rgba(91,43,255,.35)" })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...D, fontSize: 38, color: "#fff" }}>Inventory</span><Wordmark width={100} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 0.8fr 1.6fr", marginTop: 18, ...M, fontSize: 14, color: "rgba(255,255,255,.45)", padding: "0 6px" }}><span>Product</span><span>Size</span><span>Stock</span><span>Status</span></div>
        {ROWS.map(([p, s, n, st]) => (
          <div key={p} style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 0.8fr 1.6fr", alignItems: "center", marginTop: 10, padding: "14px 6px", borderRadius: 12, background: "rgba(255,255,255,.04)", ...UI, fontSize: 24, color: "#fff" }}>
            <span>{p}</span><span style={{ color: "rgba(255,255,255,.6)" }}>{s}</span><span style={{ color: st === "out" ? C.pink : st === "low" ? C.yellow : "#fff" }}>{n}</span><span><Pill bg={STATUS[st][0]} fg={STATUS[st][1]}>{STATUS[st][2]}</Pill></span>
          </div>
        ))}
      </div>
      <Sample style={{ left: 250, top: 1150 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 6 · it runs by itself ──────────────────────────────────────────────────────────────────────────────────────────
function Chain() {
  const steps = [
    ["New order", "Black tee · M · ×1", C.mint, "#063", "🛍️"],
    ["Stock drops", "Black tee · M · 4 → 3", C.iris, "#fff", "📦"],
    ["Low-stock alert", "Only 3 left. Time to restock.", C.yellow, INK, "🔔"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Automations</Eyebrow>
        <Title a="It runs" b="by itself." bColor={C.yellow} size={96} />
      </div>
      <svg width="1080" height="1350" style={{ position: "absolute", inset: 0 }}>
        <defs><filter id="g2"><feGaussianBlur stdDeviation="6" /></filter></defs>
        <path d="M150 560 V1080" stroke={C.uv} strokeWidth="12" filter="url(#g2)" opacity=".7" /><path d="M150 560 V1080" stroke={C.iris} strokeWidth="4" />
      </svg>
      {steps.map(([t, d, bg, fg, ic], i) => (
        <div key={t} style={{ position: "absolute", left: 80, top: 500 + i * 200, display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ width: 140, height: 140, borderRadius: 99, background: bg, display: "grid", placeItems: "center", fontSize: 62, boxShadow: `0 0 50px ${bg}66`, flex: "none" }}>{ic}</div>
          <div style={{ padding: "24px 30px", borderRadius: 24, background: C.paper, width: 680, boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
            <div style={{ ...M, fontSize: 18, color: C.mute }}>Step {i + 1}</div>
            <div style={{ ...D, fontSize: 46, color: INK, marginTop: 8 }}>{t}</div>
            <div style={{ fontFamily: "UIR", fontSize: 26, color: "#3A3550", marginTop: 6 }}>{d}</div>
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 80, top: 1112, ...UI, fontSize: 28, color: "rgba(255,255,255,.8)" }}>No counting. No checking. <span style={{ color: C.yellow }}>You just get told.</span></div>
      <Swipe ph={0} />
    </>
  );
}

// ── 7 · one screen ─────────────────────────────────────────────────────────────────────────────────────────────────
function Dashboard() {
  const bars = [42, 58, 50, 74, 66, 88, 70];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Custom dashboard</Eyebrow>
        <Title a="Sales, stock, top items." b="One screen." bColor={C.iris} size={80} />
      </div>
      <div style={card({ left: 80, top: 470, width: 920, height: 650, padding: 28, background: "#13112A", border: "2px solid rgba(143,114,255,.4)" })}>
        <div style={{ display: "flex", gap: 16 }}>
          {[["Today's sales", "$1,240", "#fff"], ["Orders", "18", "#fff"], ["Low stock", "3", C.yellow]].map(([k, v, c]) => (
            <div key={k} style={{ flex: 1, padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ ...M, fontSize: 14, color: "rgba(255,255,255,.5)" }}>{k}</div>
              <div style={{ ...D, fontSize: 52, color: c, marginTop: 8 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
          <div style={{ flex: 1.3, padding: 22, borderRadius: 16, background: "rgba(255,255,255,.04)" }}>
            <div style={{ ...M, fontSize: 14, color: "rgba(255,255,255,.5)" }}>Sales · last 7 days</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 280, marginTop: 20 }}>
              {bars.map((b, i) => <div key={i} style={{ flex: 1, height: `${b}%`, borderRadius: 10, background: i === 5 ? `linear-gradient(180deg, ${C.yellow}, #F5A623)` : `linear-gradient(180deg, ${C.iris}, ${C.uv})` }} />)}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 10 }}>{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} style={{ flex: 1, textAlign: "center", ...M, fontSize: 13, color: "rgba(255,255,255,.45)" }}>{d}</span>)}</div>
          </div>
          <div style={{ flex: 1, padding: 22, borderRadius: 16, background: "rgba(255,255,255,.04)" }}>
            <div style={{ ...M, fontSize: 14, color: "rgba(255,255,255,.5)" }}>Top items</div>
            {[["Black tee", 46], ["Tote bag", 31], ["Linen shirt", 24], ["Beige set", 17]].map(([p, n], i) => (
              <div key={p} style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", ...UI, fontSize: 22, color: "#fff" }}><span>{p}</span><span style={{ color: "rgba(255,255,255,.6)" }}>{n} sold</span></div>
                <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", marginTop: 8 }}><div style={{ width: `${(n / 46) * 100}%`, height: "100%", borderRadius: 99, background: i ? C.iris : C.yellow }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Sample style={{ left: 80, top: 1150 }} />
      <Swipe ph={0} />
    </>
  );
}

// ── 8 · the price ──────────────────────────────────────────────────────────────────────────────────────────────────
function Price() {
  const lines = [["Inventory & orders system", "✓"], ["Automations & alerts", "✓"], ["Custom dashboard", "✓"], ["Admin panel", "✓"], ["Hosting", "Included"], ["Monthly fees", "$0"]];
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 190 }}>
        <Eyebrow>Web app · custom</Eyebrow>
        <Title a="Built for your business." b="Paid once." bColor={C.yellow} size={84} />
      </div>
      <div style={{ position: "absolute", left: 190, top: 460, width: 700, transform: "rotate(-1.5deg)" }}>
        <div style={{ background: C.paper, borderRadius: "22px 22px 0 0", padding: "38px 48px 32px", boxShadow: "0 50px 110px rgba(0,0,0,.6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Wordmark width={140} fill={INK} spark={C.uv} /><span style={{ ...M, fontSize: 16, color: C.mute }}>Receipt</span></div>
          <div style={{ ...UI, fontSize: 30, color: INK, marginTop: 28 }}>Web app · Inventory system</div>
          <div style={{ borderTop: "2px dashed #CFCAE0", marginTop: 20 }} />
          {lines.map(([a, b]) => <div key={a} style={{ display: "flex", justifyContent: "space-between", marginTop: 14, ...UIR, fontSize: 27, color: "#3A3550" }}><span>{a}</span><span style={{ ...UI, color: b === "$0" ? C.uv : INK }}>{b}</span></div>)}
          <div style={{ borderTop: "2px dashed #CFCAE0", marginTop: 24 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 18 }}>
            <span style={{ ...M, fontSize: 18, color: C.mute }}>Starting at · pay once</span>
            <span style={{ ...D, fontSize: 92, color: INK, marginTop: 6 }}>$500</span>
          </div>
        </div>
        <svg width="700" height="28" viewBox="0 0 700 28" style={{ display: "block" }}><path d={`M0 0 H700 V8 ${Array.from({ length: 25 }, (_, i) => `L${700 - i * 28 - 14} 26 L${700 - (i + 1) * 28} 8`).join(" ")} Z`} fill={C.paper} /></svg>
        <div style={{ position: "absolute", left: 40, top: 560, padding: "14px 26px", border: `7px solid ${C.uv}`, borderRadius: 14, ...M, fontWeight: 600, fontSize: 44, letterSpacing: "0.1em", color: C.uv, opacity: 0.92, transform: "rotate(-9deg)" }}>Paid once</div>
      </div>
      <Swipe ph={0} />
    </>
  );
}

// ── 9 · the DM ──────────────────────────────────────────────────────────────────────────────────────────────────
function Cta() {
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 200 }}>
        <Eyebrow>Let's talk</Eyebrow>
        <div style={{ ...D, fontSize: 100, color: "#fff", marginTop: 26 }}>Stop counting.<br /><span style={{ color: C.yellow }}>Start selling.</span></div>
        <div style={{ ...UI, fontSize: 32, color: "rgba(255,255,255,.75)", marginTop: 30, lineHeight: 1.4 }}>Inventory system · <span style={{ color: C.yellow }}>from $500</span><br />Pay once · hosting included</div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 760 }}>
        <div style={{ padding: "24px 36px", borderRadius: 26, background: C.yellow, boxShadow: "0 20px 60px rgba(255,210,63,.3)" }}>
          <div style={{ ...M, fontSize: 22, color: INK }}>DM us to book a call</div>
          <div style={{ ...D, fontSize: 76, color: INK, marginTop: 8 }}>“SYSTEM”</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1010, ...M, fontSize: 24, color: "rgba(255,255,255,.7)" }}>@appifylb</div>
      <div style={{ position: "absolute", left: 650, top: 480 }}>
        <Dev width={350} thumbs={1} smile={1} happy={1} brow={16} lid={0.05} look={-8} tilt={-3} />
      </div>
    </>
  );
}

const SLIDES = [Hook, Places, Twice, Fridays, Flip, Chain, Dashboard, Price, Cta];
export const InvSlide = ({ slide = 0 }) => {
  const f = useCurrentFrame(), ph = (f % LOOP) / LOOP;
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const S = SLIDES[slide];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Canvas slide={slide} ph={ph} n={INV_N} />
      <S ph={ph} />
      <Chrome slide={slide} n={INV_N} />
    </AbsoluteFill>
  );
};
