// "Hey Appify, I want an ecommerce website." A chat prompt is the hook; the reply is the build: a sample store
// assembles itself on a phone, one day every 3 beats (design, products, checkout, admin, analytics, motion, live).
// Scenes are cut with the Appify spark.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MSG, TYPE0, TYPE_RATE, SEND, DOTS, REPLY, BUILD, DAYS, DAY_LEN, dayAt, PRICE, TABLE, END, CUTS, MONTHLY, LIFETIME, YEARS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Burst, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";
import { Sneaker, Hoodie, Cap, Watch } from "./products.jsx";

const C = { ink: "#0A0913", ink2: "#17142B", ink3: "#221D40", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", mute: "#8A84A3", line: "#E6E3EF" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const UI = { fontFamily: "UI", fontWeight: 600 };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.5) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.iris, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const SH = 1400;
function Stage({ W, H, children, style }) {
  const tall = H > 1600, k = Math.min(1, (H - 90) / SH);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: tall ? 220 : (H - SH * k) / 2, width: 1080, height: SH, transform: `scale(${k})`, transformOrigin: "0 0", ...style }}>{children}</div>;
}
const Grid = ({ f }) => <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `540px ${f * 0.8}px` }} />;
const Glow = ({ y = 50, a = 0.5 }) => <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${y}%, rgba(91,43,255,${a}), transparent 62%)` }} />;
function DevHead({ size }) {   // Dev's head and shoulders in a circle (chat avatar), framed like the profile picture
  const k = size / 430, w = 420 * k;            // ~430 Dev units (hair to chest) fill the circle
  return (
    <div style={{ width: size, height: size, borderRadius: 99, overflow: "hidden", position: "relative", flex: `0 0 ${size}px`, background: "radial-gradient(circle at 50% 38%, #9C84FF 0%, #5B2BFF 50%, #2A1287 100%)", boxShadow: "0 0 0 3px rgba(255,255,255,.9), 0 8px 24px rgba(0,0,0,.35)" }}>
      <div style={{ position: "absolute", left: size / 2 - (300 - 90) * k, top: size * 0.5 - (300 - 50) * k }}><Dev width={w} brow={16} lid={0.08} smile={1} /></div>
    </div>
  );
}

// ── 1 · hook: the prompt is typed, sent, and Dev replies ───────────────────────────────────────────
function Hook({ f, W, H }) {
  const n = Math.max(0, Math.min(MSG.length, Math.floor((f - TYPE0 + 2) * TYPE_RATE)));
  const sent = f >= SEND, sendP = sp(f, SEND, 13, 200);
  const caret = Math.floor(f / 8) % 2 === 0;
  const head = sp(f, -6, 14, 200);
  const replyP = sp(f, REPLY, 11, 240);
  const press = f >= SEND - 3 && f < SEND + 3 ? 0.86 : 1;
  // the input sits big in the middle while typing, then drops to the bottom once the message is sent
  const inY = interpolate(sendP, [0, 1], [560, 1190]), inScale = interpolate(sendP, [0, 1], [1, 0.82]);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={45} a={0.45} />
      <Stage W={W} H={H}>
        {/* chat header */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 10, display: "flex", justifyContent: "center", ...rise(head) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 30px 14px 14px", borderRadius: 99, background: "rgba(23,20,43,.85)", border: "2px solid rgba(143,114,255,.35)" }}>
            <DevHead size={74} />
            <div><div style={{ ...D, fontSize: 38, color: "#fff" }}>appify</div><div style={{ ...M, fontSize: 18, color: C.sky, marginTop: 6 }}>● online</div></div>
          </div>
        </div>
        {/* the sent prompt */}
        {sent && (
          <div style={{ position: "absolute", right: 50, top: interpolate(sendP, [0, 1], [inY, 190]), maxWidth: 820, padding: "30px 38px", borderRadius: "42px 42px 12px 42px", background: `linear-gradient(135deg, ${C.uv}, ${C.iris})`, boxShadow: "0 20px 60px rgba(91,43,255,.45)", ...D, fontSize: 66, lineHeight: 1.08, color: "#fff", opacity: Math.min(1, sendP * 2), transform: `scale(${interpolate(sendP, [0, 1], [0.9, 1])})`, transformOrigin: "100% 100%" }}>
            {MSG}
          </div>
        )}
        {/* Dev is typing… then replies */}
        {f >= DOTS && (
          <div style={{ position: "absolute", left: 50, top: 520, display: "flex", gap: 18, alignItems: "flex-end" }}>
            <DevHead size={96} />
            {f < REPLY ? (
              <div style={{ padding: "26px 32px", borderRadius: "36px 36px 36px 10px", background: "#fff", display: "flex", gap: 12, ...pop(sp(f, DOTS, 12, 260), 0.6) }}>
                {[0, 1, 2].map((k) => <i key={k} style={{ width: 20, height: 20, borderRadius: 99, background: C.mute, transform: `translateY(${Math.sin((f - DOTS) / 2.2 - k) * 6}px)` }} />)}
              </div>
            ) : (
              <div style={{ padding: "30px 36px", borderRadius: "40px 40px 40px 12px", background: "#fff", maxWidth: 760, ...pop(replyP, 0.7), transformOrigin: "0 100%" }}>
                <div style={{ ...D, fontSize: 80, color: C.ink }}>Say less.</div>
                <div style={{ ...D, fontSize: 48, color: C.uv, marginTop: 14, lineHeight: 1.1 }}>Your store, live in 7 days.</div>
              </div>
            )}
          </div>
        )}
        {/* the input bar */}
        <div style={{ position: "absolute", left: 40, right: 40, top: inY, transform: `scale(${inScale})`, transformOrigin: "50% 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, padding: "28px 28px 28px 40px", borderRadius: 44, background: C.ink2, border: `3px solid ${sent ? "rgba(143,114,255,.3)" : C.iris}`, boxShadow: sent ? "none" : "0 0 70px rgba(143,114,255,.35)" }}>
            <div style={{ flex: 1, minHeight: 150, ...D, fontSize: 72, lineHeight: 1.08, color: sent ? C.mute : "#fff" }}>
              {sent ? <span style={{ ...UI, fontSize: 40, color: C.mute }}>Message appify…</span> : <>{MSG.slice(0, n)}<span style={{ display: "inline-block", width: 6, height: 70, marginLeft: 4, verticalAlign: "-8px", background: C.sky, opacity: caret ? 1 : 0 }} /></>}
            </div>
            <div style={{ flex: "0 0 96px", height: 96, borderRadius: 99, background: n === MSG.length || sent ? C.uv : C.ink3, display: "grid", placeItems: "center", transform: `scale(${press})` }}>
              <svg width="44" height="44" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 2 · build: the store assembles itself, one day at a time ──────────────────────────────────────
const PRODUCTS = [["Kova Runner 2", 129, Sneaker, "#5B2BFF"], ["Loop Hoodie", 79, Hoodie, "#2B2733"], ["Field Cap", 35, Cap, "#74C6FF"], ["Arc Watch", 199, Watch, "#0A0913"]];
const SW = 536, SCR = 1016;   // phone screen size

function CartIcon({ count, bump }) {
  return (
    <div style={{ position: "relative", width: 56, height: 56, display: "grid", placeItems: "center", transform: `scale(${bump})` }}>
      <svg width="40" height="40" viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7Z M9 7a3 3 0 0 1 6 0" stroke={C.ink} strokeWidth="2" fill="none" strokeLinejoin="round" /></svg>
      {count > 0 && <div style={{ position: "absolute", right: -4, top: -4, minWidth: 30, height: 30, borderRadius: 99, background: C.uv, color: "#fff", ...UI, fontSize: 18, display: "grid", placeItems: "center" }}>{count}</div>}
    </div>
  );
}
function Store({ f, day, t }) {
  const styled = (at) => (day > 0 ? 1 : Math.min(1, sp(t, at, 14, 200)));
  const prod = (k) => (day > 1 ? 1 : day < 1 ? 0 : sp(t, 4 + k * 4, 11, 220));
  const added = day > 1 || (day === 1 && t >= 28);
  const bump = day === 1 && t >= 28 ? 1 + 0.35 * Math.exp(-(t - 28) / 4) : 1;
  const motion = day === 5 ? t : day > 5 ? DAY_LEN + t : -1;   // day 6: the hero comes alive
  const heroP = styled(19);
  const wire = (k) => ({ border: `3px dashed ${C.line}`, background: "#FAF9FD" });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", overflow: "hidden" }}>
      <div style={{ height: 44, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", ...UI, fontSize: 18, color: C.ink }}><span>9:41</span><span>●●● ▮</span></div>
      <div style={{ height: 76, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: Math.max(0.35, styled(15)) }}>
        <div style={{ ...D, fontSize: 36, color: styled(15) > 0.5 ? C.ink : C.line }}>your.store</div>
        <CartIcon count={added ? 1 : 0} bump={bump} />
      </div>
      {/* hero */}
      <div style={{ position: "absolute", left: 20, top: 130, width: SW - 40, height: 290, borderRadius: 30, overflow: "hidden", ...(heroP < 0.5 ? wire() : {}) }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.uv}, ${C.iris})`, opacity: heroP }} />
        <div style={{ position: "absolute", left: 30, top: 40, opacity: heroP }}>
          <div style={{ ...M, fontSize: 18, color: "rgba(255,255,255,.8)" }}>new drop</div>
          <div style={{ ...D, fontSize: 56, color: "#fff", marginTop: 12, lineHeight: 1.02 }}>
            {"Run lighter.".split("").map((ch, k) => <span key={k} style={{ display: "inline-block", whiteSpace: "pre", transform: motion >= 0 ? `translateY(${Math.sin(motion / 3 - k * 0.5) * 8}px)` : "none" }}>{ch}</span>)}
          </div>
          <div style={{ marginTop: 22, display: "inline-block", padding: "12px 22px", borderRadius: 99, background: "#fff", ...UI, fontSize: 20, color: C.uv }}>Shop now</div>
        </div>
        <div style={{ position: "absolute", right: -40, top: 70, opacity: heroP, transform: motion >= 0 ? `translateY(${Math.sin(motion / 5) * 14}px) rotate(${-14 + Math.sin(motion / 7) * 8}deg) scale(${1 + 0.05 * Math.sin(motion / 4)})` : "rotate(-14deg)" }}>
          <Sneaker size={220} color="#fff" accent={C.sky} id="hero" />
        </div>
        {motion >= 0 && [0, 1, 2, 3].map((k) => <Spark key={k} size={30 + k * 8} color="#fff" style={{ position: "absolute", left: 250 + k * 50, top: 30 + (k % 2) * 180, opacity: 0.5 + 0.5 * Math.sin(motion / 3 + k * 2), transform: `rotate(${motion * 4 + k * 40}deg) scale(${0.6 + 0.4 * Math.abs(Math.sin(motion / 5 + k))})` }} />)}
      </div>
      {/* product grid */}
      {PRODUCTS.map(([name, price, Img, col], k) => {
        const x = 20 + (k % 2) * 258, y = 440 + Math.floor(k / 2) * 290, p = prod(k), s = styled(23 + k * 2);
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, width: 238, height: 270, borderRadius: 26, background: s > 0.5 ? "#F6F4FC" : "#FAF9FD", border: s > 0.5 ? "2px solid #EEEAF8" : `3px dashed ${C.line}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 160, display: "grid", placeItems: "center", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * -120}px) scale(${0.8 + 0.2 * Math.min(1, p)})` }}><Img size={150} color={col} id={`p${k}`} /></div>
            {p > 0.05 ? (
              <div style={{ position: "absolute", left: 18, bottom: 18, opacity: Math.min(1, p * 2) }}>
                <div style={{ ...UI, fontSize: 21, color: "#333" }}>{name}</div>
                <div style={{ ...D, fontSize: 28, color: C.ink, marginTop: 6 }}>${price}</div>
              </div>
            ) : (
              <div style={{ position: "absolute", left: 18, bottom: 22 }}><i style={{ display: "block", width: 130, height: 14, borderRadius: 8, background: C.line }} /><i style={{ display: "block", width: 70, height: 18, borderRadius: 8, background: C.line, marginTop: 10 }} /></div>
            )}
            {p > 0.05 && <div style={{ position: "absolute", right: 14, bottom: 14, width: 48, height: 48, borderRadius: 99, background: k === 0 && added ? C.sky : C.uv, color: "#fff", display: "grid", placeItems: "center", ...D, fontSize: 30, transform: `scale(${k === 0 && day === 1 && t >= 25 && t < 30 ? 0.8 : 1})` }}>{k === 0 && added ? "✓" : "+"}</div>}
          </div>
        );
      })}
      {/* the tap on day 2 */}
      {day === 1 && t >= 20 && t < 34 && <div style={{ position: "absolute", left: 20 + 238 - 38 - 30, top: 440 + 270 - 38 - 30, width: 76, height: 76, borderRadius: 99, background: "rgba(10,9,19,.2)", border: "4px solid rgba(255,255,255,.95)", transform: `scale(${interpolate(t, [20, 28, 34], [1.6, 0.8, 1.2], clamp)})`, opacity: interpolate(t, [30, 34], [1, 0], clamp) }} />}
    </div>
  );
}
function Checkout({ t }) {
  const sheet = sp(t, 2, 14, 180), paid = t >= 30, press = t >= 27 && t < 31 ? 0.94 : 1, ok = sp(t, 30, 9, 280);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(10,9,19,${0.4 * Math.min(1, sheet)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, borderRadius: "40px 40px 0 0", background: "#fff", padding: "34px 30px", transform: `translateY(${(1 - Math.min(1, sheet)) * 580}px)` }}>
        <div style={{ width: 70, height: 8, borderRadius: 9, background: C.line, margin: "-14px auto 22px" }} />
        <div style={{ ...D, fontSize: 42, color: C.ink }}>Checkout</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26 }}>
          <div style={{ width: 96, height: 80, borderRadius: 18, background: "#F6F4FC", display: "grid", placeItems: "center" }}><Sneaker size={80} color={C.uv} id="co" /></div>
          <div style={{ flex: 1, ...UI, fontSize: 24, color: "#333" }}>Kova Runner 2<div style={{ fontFamily: "UI", fontWeight: 400, fontSize: 20, color: C.mute, marginTop: 4 }}>Size 42 · Violet</div></div>
          <div style={{ ...D, fontSize: 28, color: C.ink }}>$129</div>
        </div>
        {[["Shipping", "Free"], ["Total", "$129"]].map(([a, b], k) => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", marginTop: k ? 16 : 30, paddingTop: k ? 16 : 0, borderTop: k ? `2px solid ${C.line}` : "none", ...(k ? { ...D, fontSize: 36, color: C.ink } : { ...UI, fontSize: 24, color: C.mute }) }}><span>{a}</span><span>{b}</span></div>
        ))}
        <div style={{ marginTop: 34, height: 100, borderRadius: 30, background: paid ? C.sky : C.uv, display: "grid", placeItems: "center", ...D, fontSize: 38, color: paid ? C.ink : "#fff", transform: `scale(${press * (paid ? interpolate(ok, [0, 1], [1.08, 1]) : 1)})` }}>{paid ? "✓  Order placed" : "Pay $129"}</div>
      </div>
    </>
  );
}
const ORDERS = [["#1042", "Loop Hoodie", "$79", "Paid"], ["#1041", "Field Cap", "$35", "Shipped"], ["#1040", "Arc Watch", "$199", "Shipped"]];
function Admin({ day, t }) {
  const tab = day === 3 ? 0 : 2, newRow = day > 3 ? 1 : sp(t, 14, 12, 220), toggle = day > 3 ? 1 : interpolate(t, [30, 35], [0, 1], { ...clamp, easing: easeOut });
  const line = day === 4 ? interpolate(t, [6, 32], [0, 1], { ...clamp, easing: easeOut }) : 0;
  const pts = [0.2, 0.32, 0.28, 0.46, 0.42, 0.63, 0.58, 0.8, 0.92];
  const cw = SW - 80, ch = 300;
  const path = pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * cw},${ch - v * ch}`).join(" ");
  const rev = Math.round(4830 * line), ord = Math.round(62 * line);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink2, overflow: "hidden" }}>
      <div style={{ height: 44 }} />
      <div style={{ padding: "6px 26px 0", display: "flex", alignItems: "center", gap: 12 }}><Spark size={30} color={C.iris} /><div style={{ ...D, fontSize: 36, color: "#fff" }}>Admin</div><div style={{ marginLeft: "auto", ...M, fontSize: 15, color: C.sky }}>your.store</div></div>
      <div style={{ display: "flex", gap: 26, padding: "24px 26px 0", borderBottom: "2px solid rgba(255,255,255,.08)" }}>
        {["Orders", "Products", "Analytics"].map((s, k) => <div key={s} style={{ ...UI, fontSize: 22, color: k === tab ? "#fff" : C.mute, paddingBottom: 14, borderBottom: `4px solid ${k === tab ? C.uv : "transparent"}` }}>{s}</div>)}
      </div>
      {tab === 0 ? (
        <div style={{ padding: "18px 22px" }}>
          {[["#1043", "Kova Runner 2", "$129", "Paid"], ...ORDERS].map((o, k) => {
            const isNew = k === 0, p = isNew ? newRow : 1;
            return (
              <div key={o[0]} style={{ display: "flex", alignItems: "center", gap: 14, height: 84, padding: "0 18px", marginBottom: 12, borderRadius: 20, background: isNew ? `rgba(91,43,255,${0.15 + 0.35 * Math.exp(-Math.max(0, t - 14) / 10) * (day === 3 ? 1 : 0)})` : "rgba(255,255,255,.04)", border: isNew ? "2px solid rgba(143,114,255,.5)" : "2px solid transparent", opacity: Math.min(1, p * 2), transform: `translateX(${(1 - Math.min(1, p)) * 300}px)` }}>
                <div style={{ ...M, fontSize: 16, color: C.mute, letterSpacing: "0.06em" }}>{o[0]}</div>
                <div style={{ flex: 1, ...UI, fontSize: 22, color: "#fff" }}>{o[1]}</div>
                <div style={{ ...D, fontSize: 24, color: "#fff" }}>{o[2]}</div>
                <div style={{ ...M, fontSize: 14, padding: "6px 10px", borderRadius: 99, background: o[3] === "Paid" ? "rgba(116,198,255,.18)" : "rgba(255,255,255,.08)", color: o[3] === "Paid" ? C.sky : C.mute, letterSpacing: "0.06em" }}>{o[3]}</div>
              </div>
            );
          })}
          <div style={{ ...M, fontSize: 16, color: C.mute, margin: "26px 4px 14px" }}>inventory</div>
          {[["Kova Runner 2", toggle], ["Loop Hoodie", 1], ["Field Cap", 1]].map(([n, v]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70, padding: "0 18px", ...UI, fontSize: 22, color: "#fff" }}>
              {n}<div style={{ width: 74, height: 42, borderRadius: 99, background: v > 0.5 ? C.uv : "#3A3556", position: "relative" }}><div style={{ position: "absolute", top: 5, left: 5 + 32 * v, width: 32, height: 32, borderRadius: 99, background: "#fff" }} /></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "22px 22px" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {[["Revenue", "$" + rev.toLocaleString("en-US")], ["Orders", String(ord)]].map(([a, b]) => (
              <div key={a} style={{ flex: 1, padding: "20px 20px", borderRadius: 22, background: "rgba(255,255,255,.05)", border: "2px solid rgba(143,114,255,.25)" }}>
                <div style={{ ...M, fontSize: 15, color: C.mute }}>{a}</div><div style={{ ...D, fontSize: 46, color: "#fff", marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{b}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 18, borderRadius: 22, background: "rgba(255,255,255,.05)", border: "2px solid rgba(143,114,255,.25)" }}>
            <div style={{ ...M, fontSize: 15, color: C.mute, marginBottom: 14 }}>sales · last 30 days</div>
            <svg width={cw} height={ch + 10} style={{ overflow: "visible" }}>
              <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.uv} stopOpacity=".55" /><stop offset="1" stopColor={C.uv} stopOpacity="0" /></linearGradient></defs>
              {[0, 1, 2].map((k) => <line key={k} x1="0" x2={cw} y1={(k * ch) / 3} y2={(k * ch) / 3} stroke="rgba(255,255,255,.06)" strokeWidth="2" />)}
              <path d={`${path} L${cw},${ch} L0,${ch} Z`} fill="url(#ar)" opacity={line} />
              <path d={path} fill="none" stroke={C.sky} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - line} />
            </svg>
          </div>
          <div style={{ ...M, fontSize: 15, color: C.mute, marginTop: 18, textAlign: "center" }}>sample data</div>
        </div>
      )}
    </div>
  );
}
function Build({ f, W, H }) {
  const day = Math.min(DAYS.length - 1, Math.floor((f - BUILD) / DAY_LEN)), t = f - dayAt(day);
  const flip = sp(t, 0, 11, 260);
  const screen = day === 3 || day === 4 ? "admin" : "store";
  const live = day === 6, liveP = sp(t, 4, 10, 260);
  const [sx, sy] = shake(f, BUILD, 16, 5);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={58} a={0.5} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 10, textAlign: "center" }}>
          <div style={{ ...M, fontSize: 28, color: C.sky }}>day <span style={{ ...D, fontSize: 40, letterSpacing: 0, color: "#fff", display: "inline-block", transform: `translateY(${(1 - Math.min(1, flip)) * -30}px)`, opacity: Math.min(1, flip * 2) }}>{day + 1}</span> / 7</div>
          <div key={day} style={{ ...D, fontSize: 76, color: "#fff", marginTop: 16, ...rise(flip, 50) }}>{DAYS[day]}</div>
        </div>
        <div style={{ position: "absolute", left: 270, right: 270, top: 196, display: "flex", gap: 10 }}>
          {DAYS.map((_, k) => <div key={k} style={{ flex: 1, height: 8, borderRadius: 9, background: k < day ? C.iris : k === day ? C.sky : "rgba(255,255,255,.15)", transform: k === day ? `scaleX(${interpolate(t, [0, DAY_LEN], [0.2, 1], clamp)})` : "none", transformOrigin: "0 50%" }} />)}
        </div>
        {/* phone */}
        <div style={{ position: "absolute", left: (1080 - 560) / 2, top: 250, width: 560, height: 1040, borderRadius: 72, background: "#000", padding: 12, boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 3px rgba(143,114,255,.35)" }}>
          <div style={{ position: "relative", width: SW, height: SCR, borderRadius: 60, overflow: "hidden" }}>
            {screen === "store" ? <Store f={f} day={day} t={t} /> : <Admin day={day} t={t} />}
            {day === 2 && <Checkout t={t} />}
            {live && (
              <div style={{ position: "absolute", left: 20, right: 20, top: 52, height: 64, borderRadius: 99, background: C.ink, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", ...pop(liveP, 0.6) }}>
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" stroke={C.sky} strokeWidth="2.2" fill="none" /></svg>
                <div style={{ flex: 1, ...UI, fontSize: 24, color: "#fff" }}>your-store.com</div>
                <div style={{ ...M, fontSize: 18, padding: "8px 14px", borderRadius: 99, background: C.sky, color: C.ink, letterSpacing: "0.1em" }}>● live</div>
              </div>
            )}
            <div style={{ position: "absolute", left: (SW - 160) / 2, top: 14, width: 160, height: 34, borderRadius: 99, background: "#000" }} />
          </div>
        </div>
        {live && <Burst f={f} cx={540} cy={520} start={dayAt(6) + 4} count={110} speed={34} seed="live" colors={["#fff", C.sky, C.iris, C.uv]} scale={1} gravity={0.06} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1310, textAlign: "center", ...M, fontSize: 20, color: C.mute }}>demo store · built by appify</div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 3 · price ──────────────────────────────────────────────────────────────────────────────────────
function Price({ f, W, H }) {
  const t = f - PRICE, slam = sp(t, 6, 8, 300);
  const [sx, sy] = shake(t, 6, 18, 4);
  return (
    <AbsoluteFill style={{ background: C.uv }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,.22), transparent 55%)" }} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", ...D, fontSize: 110, color: "#fff", ...pop(sp(t, 0, 10, 300)) }}>The whole store.</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", ...D, fontSize: 300, color: "#fff", letterSpacing: "-0.06em", opacity: Math.min(1, slam * 3), transform: `scale(${interpolate(slam, [0, 1], [2.2, 1])})` }}>$360</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...D, fontSize: 80, color: C.sky, ...pop(sp(t, 14, 10, 280)) }}>once.</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 920, display: "flex", justifyContent: "center", gap: 16 }}>
          {["$0/month", "free hosting", "full control"].map((s, k) => <div key={s} style={{ ...M, fontSize: 28, padding: "16px 24px", borderRadius: 99, background: "#fff", color: C.uv, ...pop(sp(t, 22 + k * 4, 10, 280), 1.4) }}>{s}</div>)}
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 4 · comparison table: subscription builder vs Appify, then how much cheaper ─────────────────────
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const BUILDER_TOTAL = MONTHLY * 12 * YEARS, SAVE = BUILDER_TOTAL - LIFETIME, CHEAPER = Math.round((SAVE / BUILDER_TOTAL) * 100);
const COMPARE = [
  ["Price", `$${MONTHLY}/month`, `$${LIFETIME} once`],
  [`${YEARS} years`, money(BUILDER_TOTAL), money(LIFETIME)],
  ["Design", "Template", "Custom UI/UX"],
  ["Admin panel", "Their dashboard", "Your own"],
  ["Analytics", "Basic", "Custom"],
  ["Hosting", "While you pay", "Free"],
  ["Ownership", "Rented", "Yours"],
];
const ROW0 = 14, ROW_GAP = 7, BANNER = ROW0 + COMPARE.length * ROW_GAP + 6;   // frames after TABLE
function Table({ f, W, H }) {
  const t = f - TABLE, head = sp(t, 2, 12, 220), ban = sp(t, BANNER, 8, 300);
  const pct = Math.round(CHEAPER * interpolate(t, [BANNER, BANNER + 14], [0, 1], { ...clamp, easing: easeOut }));
  const [sx, sy] = shake(t, BANNER, 14, 4);
  const X0 = 40, X1 = 360, X2 = 710, X3 = 1040, RH = 104, Y0 = 150;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={45} a={0.45} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        {/* the Appify column glows the whole height */}
        <div style={{ position: "absolute", left: X2 - 10, top: 40, width: X3 - X2 + 10, height: Y0 + COMPARE.length * RH - 20, borderRadius: 34, background: "linear-gradient(180deg, rgba(91,43,255,.55), rgba(143,114,255,.22))", border: "3px solid rgba(205,190,255,.55)", boxShadow: "0 20px 70px rgba(91,43,255,.4)", opacity: Math.min(1, head * 2) }} />
        <div style={{ position: "absolute", left: X1, width: X2 - X1 - 20, top: 66, textAlign: "center", ...M, fontSize: 22, color: C.mute, ...rise(head) }}>subscription<br />builder</div>
        <div style={{ position: "absolute", left: X2, width: X3 - X2, top: 70, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, ...rise(head) }}>
          <svg viewBox={WORDMARK.viewBox} width={200} height={200 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.sky} /></svg>
        </div>
        {COMPARE.map(([label, bad, good], k) => {
          const p = sp(t, ROW0 + k * ROW_GAP, 13, 230), y = Y0 + k * RH, money2 = k < 2;
          return (
            <div key={label} style={{ position: "absolute", left: 0, top: y, width: 1080, height: RH, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * 30}px)` }}>
              <div style={{ position: "absolute", left: X0, right: 1080 - X3, top: RH - 2, height: 2, background: "rgba(255,255,255,.08)" }} />
              <div style={{ position: "absolute", left: X0, width: X1 - X0, top: 0, height: RH, display: "flex", alignItems: "center", ...UI, fontSize: 30, color: "rgba(255,255,255,.75)" }}>{label}</div>
              <div style={{ position: "absolute", left: X1, width: X2 - X1 - 20, top: 0, height: RH, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, ...D, fontSize: money2 ? 40 : 32, color: money2 ? "#FF6B7F" : "rgba(255,255,255,.5)" }}>
                <span style={{ ...D, fontSize: 26, color: "#F0384F" }}>✕</span>{bad}
              </div>
              <div style={{ position: "absolute", left: X2, width: X3 - X2, top: 0, height: RH, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, ...D, fontSize: money2 ? 42 : 34, color: "#fff" }}>
                <span style={{ width: 40, height: 40, borderRadius: 99, background: C.sky, color: C.ink, display: "grid", placeItems: "center", fontSize: 24, transform: `scale(${sp(t, ROW0 + k * ROW_GAP + 4, 8, 300)})` }}>✓</span>{good}
              </div>
            </div>
          );
        })}
        {/* how much cheaper */}
        <div style={{ position: "absolute", left: 40, right: 40, top: Y0 + COMPARE.length * RH + 40, padding: "30px 0 26px", borderRadius: 36, background: C.sky, textAlign: "center", boxShadow: "0 24px 70px rgba(116,198,255,.35)", opacity: Math.min(1, ban * 3), transform: `scale(${interpolate(ban, [0, 1], [1.4, 1])})` }}>
          <div style={{ ...D, fontSize: 132, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{pct}% cheaper</div>
          <div style={{ ...D, fontSize: 44, color: C.ink, marginTop: 12 }}>You keep {money(SAVE)} over {YEARS} years</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: Y0 + COMPARE.length * RH + 345, textAlign: "center", ...M, fontSize: 20, color: C.mute, opacity: interpolate(t, [BANNER + 8, BANNER + 14], [0, 1], clamp) }}>vs a typical ${MONTHLY}/month builder plan · {YEARS * 12} months</div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 5 · end card: your turn ────────────────────────────────────────────────────────────────────────
const ASK = "Hey Appify, I want…";
function EndCard({ f, W, H }) {
  const t = f - END, n = Math.max(0, Math.min(ASK.length, Math.floor((t - 6) * 1.3)));
  const caret = Math.floor(f / 8) % 2 === 0, cta = sp(t, 32, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 40) / 4);
  const devP = sp(t, 18, 12, 180);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={45} a={0.5 + 0.08 * Math.sin(t / 6)} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", ...D, fontSize: 140, color: "#fff", ...pop(sp(t, 0, 10, 300)) }}>Your turn.</div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 280, padding: "30px 30px 30px 40px", borderRadius: 44, background: C.ink2, border: `3px solid ${C.iris}`, boxShadow: "0 0 70px rgba(143,114,255,.35)", display: "flex", alignItems: "center", gap: 20, ...rise(sp(t, 2, 12, 220)) }}>
          <div style={{ flex: 1, ...D, fontSize: 62, color: "#fff" }}>{ASK.slice(0, n)}<span style={{ display: "inline-block", width: 6, height: 60, marginLeft: 4, verticalAlign: "-8px", background: C.sky, opacity: caret ? 1 : 0 }} /></div>
          <div style={{ flex: "0 0 90px", height: 90, borderRadius: 99, background: C.uv, display: "grid", placeItems: "center" }}><svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", gap: 14 }}>
          {["an online store", "an app", "a motion ad"].map((s, k) => <div key={s} style={{ ...UI, fontSize: 30, padding: "14px 24px", borderRadius: 99, border: "2px solid rgba(143,114,255,.5)", background: "rgba(143,114,255,.12)", color: "#fff", ...pop(sp(t, 22 + k * 3, 10, 280), 0.6) }}>{s}</div>)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "28px 60px", borderRadius: 32, background: C.uv, textAlign: "center", boxShadow: "0 20px 60px rgba(91,43,255,.55)" }}>
            <div style={{ ...D, fontSize: 90, color: "#fff" }}>DM “LAUNCH”</div>
            <div style={{ ...UI, fontSize: 36, color: C.sky, marginTop: 12 }}>for a free prototype</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "grid", justifyItems: "center", gap: 14, ...rise(sp(t, 42, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={300} height={300 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.7)" }}>@appifylb · www.appify-lb.com</div>
        </div>
        <div style={{ position: "absolute", left: 20, top: SH - 470, transform: `translateY(${(1 - Math.min(1, devP)) * 600}px)` }}>
          <Dev width={230} point={1} brow={16} lid={0.08} smile={1} look={8} tilt={Math.sin(t / 8) * 2} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const scenes = [Hook, Build, Price, Table, EndCard];
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 9;
  const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  const layer = (k) => { const S = scenes[k]; return <S f={f} W={W} H={H} />; };
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {inCut && layer(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}>{layer(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.iris} strokeWidth={14 * (1 - p)} /></svg>}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.22} />}
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};
