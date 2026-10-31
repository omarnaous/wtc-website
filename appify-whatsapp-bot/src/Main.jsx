// "Your WhatsApp booking bot", an Appify reel. The one idea: the same chat that eats your day (a flood of "are you
// free?") becomes a bot that books the meeting by itself; we watch it happen live, then see the machine behind it.
// Hook (the flood) -> flip -> live demo (a WhatsApp-style chat books Wed 4 at 12:30 and it lands in the calendar)
// -> how it works (a 5-step diagram with a message travelling through it) -> DM "BOT". Dev hosts every scene.
// The chat, names and times are a sample conversation; the screens are illustrations, not a real WhatsApp capture.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FPS, FLIP, DEMO, DIAGRAM, CTA, FLOOD, CHAT, NODE0, NODE_STEP } from "./timing.js";
import { useFonts, clamp, easeOut, shake, Grain } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", paper: "#F3F1FA", yellow: "#FFD23F", pink: "#FF2D6F", mint: "#3DDC97", mute: "#8A84A3",
  wa: "#25D366", waBg: "#0B141A", waBar: "#1F2C34", waIn: "#202C33", waOut: "#005C4B", waText: "#E9EDEF", waSub: "#8696A0" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.98 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const UIR = { fontFamily: "UIR" };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });
const pop = (p, k = 1.3) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 30) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.yellow, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const Wordmark = ({ width, fill = "#fff", spark = C.yellow }) => <svg viewBox={WORDMARK.viewBox} width={width} height={(width * 1167) / 3224}><path d={WORDMARK.letters} fill={fill} /><path d={WORDMARK.spark} fill={spark} /></svg>;
const Eyebrow = ({ children, color = C.iris, style }) => <div style={{ ...M, fontSize: 26, color, display: "flex", alignItems: "center", gap: 14, ...style }}><Spark size={24} color={color} />{children}</div>;
const Check = ({ size = 34, bg = C.uv, fg = "#fff" }) => (
  <div style={{ width: size, height: size, borderRadius: 99, background: bg, display: "grid", placeItems: "center", flex: "none" }}>
    <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={fg} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

// ── the phone and a WhatsApp-style chat ─────────────────────────────────────────────────────────────────────────────
function Phone({ x, y, w, children, rot = 0, glow }) {
  const h = w * 2.17, r = w * 0.15, b = w * 0.035;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: "#1A1730", padding: b, transform: `rotate(${rot}deg)`,
      boxShadow: `0 50px 110px rgba(0,0,0,.6)${glow ? ", 0 0 90px rgba(37,211,102,.25)" : ""}`, border: "2px solid rgba(255,255,255,.12)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - b, overflow: "hidden", background: C.waBg }}>
        {children}
        <div style={{ position: "absolute", left: "50%", top: w * 0.03, width: w * 0.3, height: w * 0.085, borderRadius: 99, background: "#000", transform: "translateX(-50%)" }} />
      </div>
    </div>
  );
}
function ChatHeader({ k, name, sub, unread }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150 * k, background: C.waBar, display: "flex", alignItems: "flex-end", padding: `0 ${20 * k}px ${18 * k}px`, gap: 14 * k, zIndex: 2 }}>
      <span style={{ ...UI, fontSize: 30 * k, color: C.wa }}>‹</span>
      {unread ? <span style={{ ...UI, fontSize: 18 * k, color: "#fff", background: C.wa, borderRadius: 99, padding: `${2 * k}px ${10 * k}px`, marginBottom: 6 * k }}>{unread}</span> : null}
      <div style={{ width: 54 * k, height: 54 * k, borderRadius: 99, background: C.uv, display: "grid", placeItems: "center", flex: "none" }}><Spark size={30 * k} /></div>
      <div><div style={{ ...UI, fontSize: 24 * k, color: C.waText }}>{name}</div><div style={{ ...UIR, fontSize: 17 * k, color: C.waSub, marginTop: 2 * k }}>{sub}</div></div>
    </div>
  );
}
// one bubble. `p` 0..1 appears; `me` = the customer (right, green)
function Bubble({ k, me, p, children, buttons, tap, tapF, f, time = "12:04" }) {
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", padding: `0 ${18 * k}px`, marginTop: 12 * k, ...pop(p, 0.85), transformOrigin: me ? "100% 100%" : "0% 100%" }}>
      <div style={{ maxWidth: "80%", background: me ? C.waOut : C.waIn, color: C.waText, borderRadius: 18 * k, borderBottomRightRadius: me ? 4 * k : 18 * k, borderBottomLeftRadius: me ? 18 * k : 4 * k, padding: `${12 * k}px ${16 * k}px ${8 * k}px`, ...UIR, fontSize: 23 * k, lineHeight: 1.3 }}>
        {children}
        <div style={{ ...UIR, fontSize: 14 * k, color: C.waSub, textAlign: "right", marginTop: 4 * k }}>{time}{me ? " ✓✓" : ""}</div>
        {buttons && (
          <div style={{ display: "flex", gap: 8 * k, marginTop: 8 * k, marginBottom: 6 * k }}>
            {buttons.map((bt, i) => {
              const on = tap === i && f >= tapF, ring = tap === i && f >= tapF && f < tapF + 14 ? (f - tapF) / 14 : -1;
              return (
                <div key={bt} style={{ position: "relative", flex: 1, textAlign: "center", padding: `${10 * k}px 0`, borderRadius: 12 * k, background: on ? C.wa : "rgba(255,255,255,.08)", color: on ? "#06331C" : C.wa, ...UI, fontSize: 20 * k, transform: `scale(${on && f < tapF + 6 ? 0.92 : 1})` }}>
                  {bt}
                  {ring >= 0 && <div style={{ position: "absolute", left: "50%", top: "50%", width: 120 * k * ring, height: 120 * k * ring, marginLeft: -60 * k * ring, marginTop: -60 * k * ring, borderRadius: 99, border: `${3 * k}px solid rgba(255,255,255,${1 - ring})` }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
const Typing = ({ k, p }) => (
  <div style={{ display: "flex", padding: `0 ${18 * k}px`, marginTop: 12 * k, ...pop(p, 0.85), transformOrigin: "0% 100%" }}>
    <div style={{ background: C.waIn, borderRadius: 18 * k, borderBottomLeftRadius: 4 * k, padding: `${16 * k}px ${18 * k}px`, display: "flex", gap: 7 * k }}>
      {[0, 1, 2].map((i) => <i key={i} style={{ width: 10 * k, height: 10 * k, borderRadius: 99, background: C.waSub }} />)}
    </div>
  </div>
);

// ── Dev with a phone in his hands (drawn in Dev's coordinates over the hands-in-front pose) ─────────────────────────
function DevPhone({ width, face, tilt = 0, bob = 0 }) {
  const h = (width * 830) / 420;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} tilt={tilt} bob={bob} {...face} /></div>
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(0 ${bob}) rotate(-8 300 640)`}>
          <rect x="236" y="520" width="128" height="230" rx="22" fill="#1A1730" stroke="#0A0913" strokeWidth="7" />
          <rect x="246" y="532" width="108" height="206" rx="14" fill={C.waBg} />
          <rect x="258" y="560" width="62" height="20" rx="8" fill={C.waIn} /><rect x="282" y="590" width="62" height="20" rx="8" fill={C.waOut} />
          <rect x="258" y="620" width="70" height="40" rx="8" fill={C.waIn} /><rect x="264" y="644" width="26" height="10" rx="4" fill={C.wa} /><rect x="296" y="644" width="26" height="10" rx="4" fill={C.wa} />
          <circle cx="300" cy="700" r="15" fill={C.wa} /><path d="M293 700 l5 5 l9 -10" fill="none" stroke="#06331C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <circle cx="236" cy="700" r="24" fill="#E3AE86" stroke="#0A0913" strokeWidth="8" />
        <circle cx="364" cy="700" r="24" fill="#E3AE86" stroke="#0A0913" strokeWidth="8" />
      </svg>
    </div>
  );
}

// ── scenes ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const FLOOD_TXT = ["Hi, are you free tomorrow?", "What time works for you?", "Can we do 3pm instead?", "Sorry, can we move it?", "Is Thursday ok?", "Still available??", "Hellooo?", "Can you call me?"];
function Hook({ f }) {
  const out = interpolate(f, [FLIP - 6, FLIP + 4], [1, 0], clamp);
  const k = 470 / 470;
  const n = FLOOD.filter((a) => f >= a).length;
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 250, opacity: out }}>
        <Eyebrow color={C.pink} style={rise(sp(f, 0))}>Sound familiar?</Eyebrow>
        <div style={{ ...D, fontSize: 86, color: "#fff", marginTop: 24, ...rise(sp(f, 2, 12, 260)) }}>Booking meetings</div>
        <div style={{ ...D, fontSize: 86, color: C.pink, marginTop: 4, ...rise(sp(f, 8, 12, 260)) }}>by hand on WhatsApp?</div>
      </div>
      <div style={{ opacity: out }}>
        <Phone x={90} y={520} w={450} rot={-3}>
          <ChatHeader k={450 / 470} name="Clients" sub="12 unread chats" unread={n ? 3 + n * 4 : 0} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", flexDirection: "column" }}>
            {FLOOD.map((a, i) => f >= a && <Bubble key={i} k={450 / 470} p={sp(f, a, 11, 300)} time={`12:0${i}`}>{FLOOD_TXT[i]}</Bubble>)}
          </div>
        </Phone>
        <div style={{ position: "absolute", left: 620, top: 820 }}>
          <Dev width={300} shock={interpolate(f, [20, 30, 70, 85], [0, 0.8, 0.8, 0.2], clamp)} brow={24} smile={0.1} lid={0.05} look={-8} tilt={Math.sin(f / 3) * (f > 30 ? 2 : 0)} />
        </div>
      </div>
    </>
  );
}
function Flip({ f }) {
  if (f < FLIP - 4 || f > DEMO + 6) return null;
  const p = sp(f, FLIP, 11, 240), out = interpolate(f, [DEMO - 4, DEMO + 4], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 600, opacity: out }}>
      <div style={{ ...D, fontSize: 116, color: "#fff", ...pop(p, 1.4), transformOrigin: "0% 50%" }}>Let a bot</div>
      <div style={{ ...D, fontSize: 116, color: C.yellow, marginTop: 6, ...pop(sp(f, FLIP + 8, 11, 240), 1.5), transformOrigin: "0% 50%" }}>book them<br />for you.</div>
      <div style={{ position: "absolute", right: -20, top: 330 }}><Dev width={250} point={1} smile={1} happy={1} brow={18} lid={0.05} look={-10} /></div>
    </div>
  );
}

function Demo({ f }) {
  const t = f - DEMO;
  if (t < -2 || f > DIAGRAM + 8) return null;
  const out = interpolate(f, [DIAGRAM - 6, DIAGRAM + 4], [1, 0], clamp);
  const k = 1, s = (at) => (t < at ? 0 : Math.min(1, sp(t, at, 12, 260)));
  const typing = (a, b) => t >= a && t < b;
  const W = 480;
  const msgs = [
    t >= CHAT.ask && <Bubble key="a" k={k} me p={s(CHAT.ask)} time="12:01">Hi! Can I book a meeting this week? 🙏</Bubble>,
    typing(CHAT.type1, CHAT.days) && <Typing key="t1" k={k} p={s(CHAT.type1)} />,
    t >= CHAT.days && <Bubble key="b" k={k} p={s(CHAT.days)} f={t} buttons={["Tue 3", "Wed 4", "Thu 5"]} tap={1} tapF={CHAT.tapDay} time="12:01">Hi Sara! 👋 Sure, pick a day:</Bubble>,
    t >= CHAT.pickDay && <Bubble key="c" k={k} me p={s(CHAT.pickDay)} time="12:01">Wed 4</Bubble>,
    typing(CHAT.type2, CHAT.times) && <Typing key="t2" k={k} p={s(CHAT.type2)} />,
    t >= CHAT.times && <Bubble key="d" k={k} p={s(CHAT.times)} f={t} buttons={["10:00", "12:30", "16:00"]} tap={1} tapF={CHAT.tapTime} time="12:02">Free times on Wed 4:</Bubble>,
    t >= CHAT.pickTime && <Bubble key="e" k={k} me p={s(CHAT.pickTime)} time="12:02">12:30</Bubble>,
    typing(CHAT.type3, CHAT.booked) && <Typing key="t3" k={k} p={s(CHAT.type3)} />,
    t >= CHAT.booked && <Bubble key="f" k={k} p={s(CHAT.booked)} time="12:02">✅ You're booked!<br /><b style={{ ...UI }}>Wed 4 · 12:30</b><br />I'll remind you 1 hour before.</Bubble>,
  ];
  const cal = sp(t, CHAT.calendar, 12, 220), thumbs = t >= CHAT.booked + 6 ? Math.min(1, sp(t, CHAT.booked + 6, 12, 200)) : 0;
  return (
    <div style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 80, top: 250, ...rise(sp(t, 0)) }}>
        <Eyebrow color={C.wa}>Live demo</Eyebrow>
        <div style={{ ...D, fontSize: 70, color: "#fff", marginTop: 20 }}>Watch it book<br /><span style={{ color: C.wa }}>a meeting by itself.</span></div>
      </div>
      <Phone x={90} y={470} w={W} glow>
        <ChatHeader k={1} name="Your Business" sub="booking bot · online" />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", flexDirection: "column" }}>{msgs}</div>
      </Phone>
      {/* the meeting lands in the calendar */}
      <div style={{ position: "absolute", left: 600, top: 520, width: 380, borderRadius: 22, background: C.paper, padding: "20px 22px", boxShadow: "0 30px 70px rgba(0,0,0,.5)", ...pop(t >= CHAT.calendar ? cal : 0, 0.7), transformOrigin: "0% 50%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, ...M, fontSize: 15, color: C.mute }}>📅 Your calendar</div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "center" }}>
          <div style={{ width: 84, borderRadius: 14, overflow: "hidden", textAlign: "center", flex: "none", border: "2px solid #E2DCF3" }}>
            <div style={{ background: C.pink, color: "#fff", ...M, fontSize: 14, padding: "4px 0" }}>Wed</div>
            <div style={{ ...D, fontSize: 44, color: C.ink, padding: "4px 0 6px" }}>4</div>
          </div>
          <div><div style={{ ...UI, fontSize: 26, color: C.ink }}>Meeting · Sara</div><div style={{ ...UIR, fontSize: 21, color: "#4A4560", marginTop: 4 }}>12:30 – 13:00</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "8px 12px", borderRadius: 12, background: "#E7FBEF", ...UI, fontSize: 18, color: "#0A7A3D" }}><Check size={24} bg={C.wa} fg="#06331C" />Booked by your WhatsApp bot</div>
      </div>
      <div style={{ position: "absolute", left: 640, top: 880 }}>
        <Dev width={290} thumbs={thumbs} smile={1} happy={thumbs > 0.5 ? 1 : 0} brow={16} lid={0.05} look={t < CHAT.booked ? -10 : -4} tilt={-3 + Math.sin(t / 10) * 1.5} bob={Math.sin(t / 7) * 2} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 1490, ...M, fontSize: 16, color: "rgba(255,255,255,.4)" }}>Sample conversation</div>
    </div>
  );
}

const STEPS = [
  ["💬", "A client messages you on WhatsApp", "Any time, day or night"],
  ["🤖", "The bot replies instantly", "and shows only your free slots"],
  ["📅", "It books the slot in your calendar", "no double bookings"],
  ["🔔", "It confirms and sends a reminder", "so clients actually show up"],
  ["📊", "You see every booking", "in one dashboard"],
];
function Diagram({ f }) {
  const t = f - DIAGRAM;
  if (t < -2 || f > CTA + 8) return null;
  const out = interpolate(f, [CTA - 6, CTA + 4], [1, 0], clamp);
  const x = 200, y0 = 600, step = 190, n = STEPS.length;
  const lineP = interpolate(f, [NODE0, NODE0 + NODE_STEP * (n - 1)], [0, 1], { ...clamp, easing: easeOut });
  const lit = (i) => (f < NODE0 + i * NODE_STEP ? 0 : Math.min(1, sp(f, NODE0 + i * NODE_STEP, 11, 260)));
  // a message travelling down the line, looping once the whole flow is lit
  const done = NODE0 + NODE_STEP * (n - 1);
  const pk = f < NODE0 ? 0 : f < done ? lineP : ((f - done) % 45) / 45;
  return (
    <div style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 80, top: 250, ...rise(sp(t, 0)) }}>
        <Eyebrow>How it works</Eyebrow>
        <div style={{ ...D, fontSize: 74, color: "#fff", marginTop: 20 }}>From message<br /><span style={{ color: C.yellow }}>to meeting.</span></div>
      </div>
      <div style={{ position: "absolute", left: 760, top: 215, ...pop(sp(t, 6, 12, 200), 0.6) }}><Dev width={190} wave={Math.max(0, Math.sin(t / 5)) * (t < 60 ? 1 : 0)} waveAng={18} smile={1} happy={1} brow={16} lid={0.05} look={-6} /></div>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <defs><filter id="g"><feGaussianBlur stdDeviation="6" /></filter></defs>
        <line x1={x} y1={y0} x2={x} y2={y0 + step * (n - 1)} stroke="rgba(255,255,255,.1)" strokeWidth="8" strokeLinecap="round" />
        <line x1={x} y1={y0} x2={x} y2={y0 + step * (n - 1) * lineP} stroke={C.uv} strokeWidth="14" strokeLinecap="round" filter="url(#g)" opacity=".8" />
        <line x1={x} y1={y0} x2={x} y2={y0 + step * (n - 1) * lineP} stroke={C.iris} strokeWidth="6" strokeLinecap="round" />
        {f >= NODE0 && <circle cx={x} cy={y0 + step * (n - 1) * pk} r="12" fill={C.yellow} />}
      </svg>
      {STEPS.map(([ic, a, b], i) => {
        const p = lit(i), y = y0 + i * step;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x - 52, top: y - 52, width: 104, height: 104, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 48,
              background: p > 0 ? (i === 0 ? C.wa : i === n - 1 ? C.yellow : C.uv) : "#1B1830", border: `3px solid ${p > 0 ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.12)"}`,
              boxShadow: p > 0 ? `0 0 ${40 * p}px ${i === 0 ? "rgba(37,211,102,.6)" : "rgba(91,43,255,.6)"}` : "none", transform: `scale(${0.8 + 0.2 * Math.min(1, p) + 0.12 * Math.max(0, 1 - Math.abs(p - 1) * 6) * 0})` }}>{ic}</div>
            <div style={{ position: "absolute", left: x + 80, top: y - 54, width: 700, ...rise(p, 24) }}>
              <div style={{ ...M, fontSize: 17, color: C.iris }}>Step {i + 1}</div>
              <div style={{ ...UI, fontSize: 36, color: "#fff", marginTop: 6 }}>{a}</div>
              <div style={{ ...UIR, fontSize: 26, color: "rgba(255,255,255,.62)", marginTop: 4 }}>{b}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Cta({ f }) {
  const t = f - CTA;
  if (t < -2) return null;
  const chips = ["Replies 24/7", "Books into your calendar", "Sends reminders"];
  const dm = sp(t, 66, 9, 260);
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 250, display: "flex", alignItems: "center", gap: 20, ...pop(sp(t, 0, 10, 300)) }}>
        <Wordmark width={230} /><span style={{ ...M, fontSize: 20, color: C.yellow }}>@appifylb</span>
      </div>
      <div style={{ position: "absolute", left: 80, top: 380 }}>
        <div style={{ ...D, fontSize: 92, color: "#fff", ...pop(sp(t, 6, 10, 300)) }}>Never miss</div>
        <div style={{ ...D, fontSize: 92, color: C.wa, marginTop: 4, ...pop(sp(t, 12, 10, 300), 1.5) }}>a booking again.</div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 620, display: "flex", flexDirection: "column", gap: 14 }}>
        {chips.map((c, i) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px 14px 14px", borderRadius: 99, background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(143,114,255,.45)", ...UI, fontSize: 30, color: "#fff", alignSelf: "flex-start", ...rise(sp(t, 26 + i * 8, 12, 260)) }}>
            <Check size={36} bg={C.wa} fg="#06331C" />{c}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 80, top: 920, transform: `scale(${interpolate(dm, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - 90) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, dm * 2) }}>
        <div style={{ padding: "22px 34px", borderRadius: 26, background: C.yellow, boxShadow: "0 20px 60px rgba(255,210,63,.3)" }}>
          <div style={{ ...M, fontSize: 19, color: C.ink }}>Want one? DM us</div>
          <div style={{ ...D, fontSize: 84, color: C.ink, marginTop: 6 }}>“BOT”</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1160, ...UIR, fontSize: 26, color: "rgba(255,255,255,.7)", ...rise(sp(t, 90)) }}>WhatsApp booking bot · designed & built by Appify</div>
      <div style={{ position: "absolute", left: 660, top: 700, transform: `translateY(${(1 - Math.min(1, sp(t, 14, 13, 200))) * 700}px)` }}>
        <DevPhone width={310} tilt={2 * Math.sin(t / 9)} bob={3 * Math.sin(t / 7)} face={{ brow: 16, lid: t % 80 > 76 ? 1 : 0.05, smile: 1, happy: 1, look: -8 }} />
      </div>
    </>
  );
}

export const Main = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const [sx, sy] = shake(f, FLIP, 12, 4);
  const flash = interpolate(f, [FLIP - 2, FLIP, FLIP + 8], [0, 0.55, 0], clamp) + interpolate(f, [CTA - 2, CTA, CTA + 8], [0, 0.35, 0], clamp);
  const glow = f < FLIP ? "rgba(255,45,111,.22)" : f < DIAGRAM ? "rgba(37,211,102,.16)" : "rgba(91,43,255,.4)";
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.22) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.22) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", opacity: 0.3 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${glow}, transparent 62%)` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {f < FLIP + 6 && <Hook f={f} />}
        <Flip f={f} />
        <Demo f={f} />
        <Diagram f={f} />
        <Cta f={f} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Grain f={f} opacity={0.04} />
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
    </AbsoluteFill>
  );
};
