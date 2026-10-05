// A realistic storefront ("KOVA", a demo brand) driven by one local frame `l` (0-180):
// 0-45 build-in + colour swatches + hover zoom · 45-90 theme editor · 90-135 add to cart + cart drawer · 135+ order confirmed
import { interpolate, spring, Easing } from "remotion";
import { clamp, easeOut } from "./fx.jsx";
import { Sneaker, Hoodie, Backpack, Cap, Watch } from "./products.jsx";

const UI = { fontFamily: "UI" };
const W = 820, H = 860;
const INK = "#0A0913", MUTE = "#6E6A7C", LINE = "#ECEAF1", CARD = "#F4F3F8";
const SHOES = ["#5B2BFF", "#FF6A3D", "#1FA971"];
const ACCENTS = ["#0A0913", "#5B2BFF", "#FF6A3D", "#1FA971", "#2B7BFF"];
const PRODUCTS = [
  { name: "Kova Fleece Hoodie", price: 72, was: 90, C: Hoodie, color: "#2B2733", sale: true },
  { name: "Daypack 22L", price: 64, C: Backpack, color: "#F0384F" },
  { name: "Wool Cap", price: 29, C: Cap, color: "#74C6FF" },
];

// cursor keyframes in store coordinates: [frame, x, y]
const PATH = [[0, 760, 1000], [12, 700, 900], [17, 108, 336], [24, 108, 336], [30, 156, 336], [37, 200, 700], [45, 210, 700],
  [52, 588, 214], [58, 588, 214], [65, 742, 318], [70, 742, 318], [72, 600, 418], [84, 740, 418], [90, 740, 418],
  [96, 150, 404], [104, 150, 404], [124, 620, 784], [134, 620, 784], [150, 860, 1060], [180, 860, 1060]];
const at = (l, i) => interpolate(l, PATH.map((p) => p[0]), PATH.map((p) => p[i]), { ...clamp, easing: Easing.inOut(Easing.cubic) });
const CLICKS = [18, 31, 55, 67, 99, 131];
const pressAt = (l) => CLICKS.reduce((m, c) => Math.max(m, l >= c && l < c + 8 ? 1 - (l - c) / 8 : 0), 0);

function Stars({ n = 4.8 }) {
  return <span style={{ color: "#F5A524", fontSize: 15, letterSpacing: 1 }}>★★★★★<span style={{ color: MUTE, marginLeft: 6, ...UI, fontSize: 14 }}>{n}</span></span>;
}

export function Storefront({ l, fps }) {
  const enter = spring({ frame: l, fps, config: { damping: 16 } });
  // design: sneaker colour from the swatches
  const shoeIdx = l < 18 ? 0 : l < 31 ? 1 : 2;
  const shoePop = spring({ frame: l - (l < 31 ? 18 : 31), fps, config: { damping: 9, stiffness: 220 } });
  const heroIn = spring({ frame: l - 4, fps, config: { damping: 10, stiffness: 140 } });
  // editor
  const editor = interpolate(l, [45, 53, 86, 92], [0, 1, 1, 0], { ...clamp, easing: easeOut });
  const accent = l >= 55 ? ACCENTS[1] : ACCENTS[0];
  const cols = l >= 67 && l < 135 ? 3 : 2;
  const colsP = spring({ frame: l - 67, fps, config: { damping: 14 } });
  const radius = interpolate(l, [72, 84], [10, 26], clamp);
  // cart
  const fly = interpolate(l, [100, 116], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const badge = l >= 116 ? 1 : 0;
  const badgePop = spring({ frame: l - 116, fps, config: { damping: 7, stiffness: 260 } });
  const drawer = interpolate(l, [117, 125], [0, 1], { ...clamp, easing: easeOut });
  const confirm = spring({ frame: l - 136, fps, config: { damping: 12 } });
  const hover = interpolate(l, [37, 42], [0, 1], clamp) * (l < 47 ? 1 : 0);
  const cx = at(l, 1), cy = at(l, 2), press = pressAt(l);
  const fx = interpolate(fly, [0, 1], [150, 770]), fy = interpolate(fly, [0, 1], [404, 76]) - Math.sin(fly * Math.PI) * 160;

  return (
    <div style={{ position: "relative", width: W, height: H, borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 50px 100px rgba(0,0,0,.45)", transform: `translateY(${(1 - enter) * 260}px) scale(${0.94 + enter * 0.06})`, transformOrigin: "50% 0%", ...UI, color: INK }}>
      {/* announcement + header */}
      <div style={{ height: 40, background: INK, color: "#fff", display: "grid", placeItems: "center", fontSize: 16, letterSpacing: "0.02em" }}>Free shipping over $50 · Powered by appifylb</div>
      <div style={{ height: 72, display: "flex", alignItems: "center", padding: "0 30px", borderBottom: `1px solid ${LINE}` }}>
        <span style={{ fontFamily: "Display", fontWeight: 600, fontSize: 28, letterSpacing: "0.14em" }}>KOVA</span>
        <span style={{ display: "flex", gap: 26, marginLeft: 46, fontSize: 18, color: MUTE }}><span style={{ color: INK }}>New</span><span>Men</span><span>Women</span><span style={{ color: "#E5484D" }}>Sale</span></span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={INK} strokeWidth="2.2" /><path d="M16 16l4.5 4.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" /></svg>
          <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4" fill="none" stroke={INK} strokeWidth="2.2" /><path d="M4.5 20c1.5-4 4.3-5.5 7.5-5.5s6 1.5 7.5 5.5" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" /></svg>
          <span style={{ position: "relative" }}>
            <svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2z" fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke={INK} strokeWidth="2.2" /></svg>
            {badge > 0 && <span style={{ position: "absolute", right: -10, top: -8, width: 22, height: 22, borderRadius: 99, background: accent === INK ? "#5B2BFF" : accent, color: "#fff", fontSize: 13, fontWeight: 600, display: "grid", placeItems: "center", transform: `scale(${badgePop})` }}>1</span>}
          </span>
        </span>
      </div>

      {/* hero */}
      <div style={{ position: "relative", height: 360, margin: "18px 22px 0", borderRadius: radius + 6, background: `linear-gradient(120deg, ${SHOES[shoeIdx]}22, #F6F5FA 60%)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 34, top: 34, width: 330 }}>
          <div style={{ fontFamily: "Mono", fontSize: 15, letterSpacing: "0.16em", color: MUTE }}>NEW DROP</div>
          <div style={{ fontFamily: "Display", fontWeight: 600, fontSize: 44, lineHeight: 1, letterSpacing: "-0.03em", marginTop: 10, whiteSpace: "nowrap" }}>Kova Runner 2</div>
          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "baseline" }}><span style={{ fontSize: 30, fontWeight: 600 }}>$129</span><span style={{ fontSize: 20, color: MUTE, textDecoration: "line-through" }}>$159</span><span style={{ fontSize: 15, fontWeight: 600, color: "#E5484D" }}>−19%</span></div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            {SHOES.map((c, i) => <span key={c} style={{ width: 30, height: 30, borderRadius: 99, background: c, boxShadow: i === shoeIdx ? `0 0 0 3px #fff, 0 0 0 5px ${INK}` : "none" }} />)}
          </div>
          <div style={{ marginTop: 26, width: 220, height: 52, borderRadius: radius, background: accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 19, transform: `scale(${l >= 99 && l < 107 ? 0.94 : 1})` }}>Add to cart</div>
        </div>
        <div style={{ position: "absolute", right: -20, top: 70, transform: `translateY(${(1 - heroIn) * -300 + Math.sin(l / 9) * 6}px) rotate(${-8 + (1 - heroIn) * 20}deg) scale(${0.92 + shoePop * 0.08})` }}>
          <Sneaker size={460} color={SHOES[shoeIdx]} id="hero" />
        </div>
      </div>

      {/* product grid */}
      <div style={{ padding: "26px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={{ fontFamily: "Display", fontWeight: 600, fontSize: 28, letterSpacing: "-0.02em" }}>Trending now</span>
          <span style={{ fontSize: 17, color: MUTE }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {PRODUCTS.slice(0, cols).map((p, i) => {
            const s = spring({ frame: l - 10 - i * 4 - (cols === 3 ? 0 : 0), fps, config: { damping: 14 } });
            const z = i === 0 ? 1 + hover * 0.08 : 1;
            const ImgH = cols === 3 ? 170 : 200;
            return (
              <div key={p.name} style={{ opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${cols === 3 && i === 2 ? colsP : 1})` }}>
                <div style={{ position: "relative", height: ImgH, borderRadius: radius, background: CARD, display: "grid", placeItems: "center", overflow: "hidden" }}>
                  <div style={{ transform: `scale(${z})` }}><p.C size={cols === 3 ? 150 : 180} color={p.color} /></div>
                  {p.sale && <span style={{ position: "absolute", left: 12, top: 12, padding: "5px 10px", borderRadius: 99, background: "#E5484D", color: "#fff", fontSize: 13, fontWeight: 600 }}>SALE</span>}
                  <span style={{ position: "absolute", right: 12, top: 12, width: 34, height: 34, borderRadius: 99, background: "#fff", display: "grid", placeItems: "center", fontSize: 16 }}>♡</span>
                  {i === 0 && hover > 0 && <span style={{ position: "absolute", left: 12, right: 12, bottom: 12, height: 42, borderRadius: radius * 0.7, background: INK, color: "#fff", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 600, opacity: hover, transform: `translateY(${(1 - hover) * 20}px)` }}>Quick add +</span>}
                </div>
                <div style={{ marginTop: 10, fontSize: cols === 3 ? 16 : 19, fontWeight: 500 }}>{p.name}</div>
                <Stars />
                <div style={{ fontSize: cols === 3 ? 16 : 19, fontWeight: 600, marginTop: 2 }}>${p.price}{p.was && <span style={{ color: MUTE, fontWeight: 400, textDecoration: "line-through", marginLeft: 8 }}>${p.was}</span>}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* theme editor */}
      {editor > 0 && (
        <div style={{ position: "absolute", top: 112, bottom: 0, right: 0, width: 360, background: "#fff", borderLeft: `1px solid ${LINE}`, boxShadow: "-30px 0 60px rgba(10,9,19,.15)", padding: "26px 28px", transform: `translateX(${(1 - editor) * 380}px)` }}>
          <div style={{ fontFamily: "Display", fontWeight: 600, fontSize: 26 }}>Theme editor</div>
          <div style={{ fontSize: 15, color: MUTE, marginTop: 4 }}>Changes go live instantly</div>
          <div style={{ marginTop: 26, fontSize: 15, fontWeight: 600, color: MUTE, letterSpacing: "0.06em" }}>BRAND COLOR</div>
          <div style={{ display: "flex", gap: 14, marginTop: 12 }}>{ACCENTS.map((c) => <span key={c} style={{ width: 40, height: 40, borderRadius: 12, background: c, boxShadow: c === accent ? `0 0 0 3px #fff, 0 0 0 5px ${INK}` : "none" }} />)}</div>
          <div style={{ marginTop: 30, fontSize: 15, fontWeight: 600, color: MUTE, letterSpacing: "0.06em" }}>PRODUCT GRID</div>
          <div style={{ display: "flex", marginTop: 12, borderRadius: 12, background: CARD, padding: 4, width: 220 }}>{[2, 3].map((n) => <span key={n} style={{ flex: 1, height: 42, borderRadius: 9, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 17, background: cols === n ? "#fff" : "transparent", boxShadow: cols === n ? "0 2px 8px rgba(0,0,0,.08)" : "none" }}>{n} columns</span>)}</div>
          <div style={{ marginTop: 30, fontSize: 15, fontWeight: 600, color: MUTE, letterSpacing: "0.06em" }}>CORNER RADIUS · {Math.round(radius)}px</div>
          <div style={{ position: "relative", height: 8, borderRadius: 8, background: CARD, marginTop: 20, width: 260 }}>
            <div style={{ position: "absolute", left: 0, height: 8, width: `${((radius - 6) / 24) * 100}%`, borderRadius: 8, background: "#5B2BFF" }} />
            <div style={{ position: "absolute", left: `calc(${((radius - 6) / 24) * 100}% - 13px)`, top: -9, width: 26, height: 26, borderRadius: 99, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.25)" }} />
          </div>
          <div style={{ marginTop: 34, fontSize: 15, fontWeight: 600, color: MUTE, letterSpacing: "0.06em" }}>FONT</div>
          <div style={{ marginTop: 12, height: 46, borderRadius: 12, border: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", fontSize: 17 }}><span>Sora · Geist</span><span>▾</span></div>
        </div>
      )}

      {/* flying product + cart drawer */}
      {fly > 0 && fly < 1 && <div style={{ position: "absolute", left: fx - 60, top: fy - 36, transform: `scale(${1 - fly * 0.7}) rotate(${fly * 30}deg)` }}><Sneaker size={120} color={SHOES[2]} id="fly" /></div>}
      {drawer > 0 && (
        <div style={{ position: "absolute", top: 112, bottom: 0, right: 0, width: 400, background: "#fff", boxShadow: "-30px 0 60px rgba(10,9,19,.18)", padding: "26px 26px", transform: `translateX(${(1 - drawer) * 420}px)` }}>
          {confirm < 0.02 ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: "Display", fontWeight: 600, fontSize: 26 }}>Your cart (1)</span><span style={{ fontSize: 22, color: MUTE }}>✕</span></div>
              <div style={{ display: "flex", gap: 16, marginTop: 24, paddingBottom: 20, borderBottom: `1px solid ${LINE}` }}>
                <div style={{ width: 110, height: 110, borderRadius: 14, background: CARD, display: "grid", placeItems: "center" }}><Sneaker size={100} color={SHOES[2]} id="cart" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 19 }}>Kova Runner 2</div>
                  <div style={{ fontSize: 15, color: MUTE, marginTop: 4 }}>Size 42 · Green</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center" }}><span style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "4px 12px", fontSize: 16 }}>−  1  +</span><span style={{ fontWeight: 600, fontSize: 19 }}>$129</span></div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 18 }}><span style={{ color: MUTE }}>Subtotal</span><span style={{ fontWeight: 600 }}>$129.00</span></div>
              <div style={{ fontSize: 14, color: "#1FA971", marginTop: 8 }}>✓ You unlocked free shipping</div>
              <div style={{ position: "absolute", left: 26, right: 26, bottom: 46, height: 58, borderRadius: radius, background: accent, color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 20, transform: `scale(${l >= 131 && l < 139 ? 0.95 : 1})` }}>Checkout · $129.00</div>
            </>
          ) : (
            <div style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", opacity: confirm, transform: `scale(${0.9 + confirm * 0.1})` }}>
              <div>
                <div style={{ width: 96, height: 96, borderRadius: 99, background: "#1FA971", color: "#fff", display: "grid", placeItems: "center", fontSize: 54, margin: "0 auto", transform: `scale(${confirm})` }}>✓</div>
                <div style={{ fontFamily: "Display", fontWeight: 600, fontSize: 30, marginTop: 22 }}>Order confirmed</div>
                <div style={{ fontSize: 17, color: MUTE, marginTop: 8 }}>#1042 · Arriving Thursday</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* cursor */}
      {l < 150 && (
        <div style={{ position: "absolute", left: cx, top: cy, zIndex: 50, transform: `scale(${1 - press * 0.18})`, transformOrigin: "0 0" }}>
          {press > 0.01 && <span style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: 99, border: "3px solid rgba(91,43,255,.6)", opacity: press, transform: `scale(${0.5 + (1 - press)})` }} />}
          <svg width="34" height="40" viewBox="0 0 26 30"><path d="M2 2 L2 24 L8 18.5 L12.5 28 L16.5 26.2 L12.2 17 L20.5 17 Z" fill={INK} stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
        </div>
      )}
    </div>
  );
}
