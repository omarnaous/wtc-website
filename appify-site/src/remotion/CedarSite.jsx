import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Browser, inOut, ramp, wave, FONT, BODY, MONO } from "./kit.jsx";

const C = { forest: "#0F2A20", moss: "#1E4434", sand: "#E9DFC9", cream: "#F7F2E7", ink: "#13201A", mut: "#6B7A70", gold: "#C9A45C" };

function Landscape({ shift }) {
  return (
    <svg viewBox="0 0 1100 420" width="1100" height="420" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4C98B" /><stop offset=".55" stopColor="#E9A877" /><stop offset="1" stopColor="#B9785E" /></linearGradient>
      </defs>
      <rect width="1100" height="420" fill="url(#sky)" />
      <circle cx={760} cy={190 + shift * 0.3} r="62" fill="#FCE3B4" />
      <path d={`M0 300 L180 190 L300 260 L470 150 L620 250 L780 170 L960 260 L1100 200 L1100 420 L0 420 Z`} fill="#8C5A4B" opacity=".75" transform={`translate(0 ${shift * 0.5})`} />
      <path d={`M0 340 L140 280 L330 330 L520 250 L700 320 L880 270 L1100 330 L1100 420 L0 420 Z`} fill="#4A3A35" transform={`translate(0 ${shift * 0.8})`} />
      <path d={`M0 380 L1100 360 L1100 420 L0 420 Z`} fill={C.forest} />
    </svg>
  );
}

const LISTINGS = [["Stone house with terrace", "Byblos · 3 bd", "$420,000", "#C9A45C"], ["Seafront apartment", "Batroun · 2 bd", "$295,000", "#7FA7A0"], ["Hillside villa", "Broummana · 5 bd", "$1.2M", "#A5786A"]];

export const CEDAR = { width: 1280, height: 800, durationInFrames: 300, fps: 30 };
export default function CedarSite() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const query = "Byblos";
  const typed = query.slice(0, Math.floor(ramp(f, 25, 60, 0, query.length + 0.01)));
  const scroll = inOut(f, 95, 135, 250, 285) * 300;
  const caret = Math.floor(f / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.moss}, ${C.forest})`, alignItems: "center", justifyContent: "center" }}>
      <Browser w={1100} h={690} url="cedar-estates.com" style={{ transform: "translateY(60px)" }} bg={C.cream}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
            <Landscape shift={scroll * 0.25} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "space-between", padding: "22px 40px", color: C.cream, font: `500 15px ${BODY}` }}>
              <span style={{ font: `600 20px ${FONT}`, letterSpacing: "-.01em" }}>Cedar Estates</span>
              <span style={{ display: "flex", gap: 28 }}><span>Buy</span><span>Rent</span><span>Sell</span><span>Agents</span></span>
            </div>
            <div style={{ position: "absolute", left: 40, top: 120, color: C.cream }}>
              <div style={{ font: `600 64px/1 ${FONT}`, letterSpacing: "-.035em", width: 560 }}>Homes above the noise.</div>
              <div style={{ marginTop: 26, width: 460, height: 58, borderRadius: 14, background: C.cream, display: "flex", alignItems: "center", padding: "0 8px 0 20px", gap: 10, boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
                <span style={{ flex: 1, font: `500 17px ${BODY}`, color: typed ? C.ink : C.mut }}>{typed || "Search a town"}{caret && f < 95 ? <span style={{ color: C.ink }}>|</span> : null}</span>
                <span style={{ height: 42, padding: "0 20px", borderRadius: 10, background: C.forest, color: C.cream, display: "flex", alignItems: "center", font: `600 15px ${FONT}` }}>Search</span>
              </div>
            </div>
          </div>
          <div style={{ padding: "34px 40px", background: C.cream }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
              <span style={{ font: `600 30px ${FONT}`, color: C.ink, letterSpacing: "-.02em" }}>Featured in Byblos</span>
              <span style={{ font: `500 14px ${MONO}`, color: C.mut }}>24 RESULTS</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {LISTINGS.map(([t, s, p, c], i) => {
                const sp = spring({ frame: f - 110 - i * 7, fps, config: { damping: 15 } });
                return (
                  <div key={t} style={{ borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.06)", transform: `translateY(${(1 - sp) * 60}px)`, opacity: interpolate(sp, [0, 1], [0.2, 1]) }}>
                    <div style={{ height: 170, background: `linear-gradient(160deg, ${c}, ${C.moss})`, position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: 14, padding: "5px 10px", borderRadius: 99, background: C.cream, font: `600 12px ${BODY}`, color: C.ink }}>New</span>
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ font: `600 17px ${FONT}`, color: C.ink }}>{t}</div>
                      <div style={{ font: `500 14px ${BODY}`, color: C.mut, margin: "4px 0 10px" }}>{s}</div>
                      <div style={{ font: `600 18px ${FONT}`, color: C.forest }}>{p}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Browser>
    </AbsoluteFill>
  );
}
