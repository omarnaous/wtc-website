// Dev, live on the page: the same SVG rig as the reels, driven by requestAnimationFrame instead of a
// video timeline. He breathes, blinks, follows the cursor with his eyes, talks in a speech bubble and
// plays gestures on demand (wave, point, thumbs, shock, laugh, wink, jump).
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Dev } from "../Dev.jsx";

const ACT_LEN = { wave: 1.8, point: 1.8, thumbs: 1.8, shock: 1.1, happy: 1.4, wink: 0.7, jump: 0.55, lean: 1.6 };
const ease = (x) => x * x * (3 - 2 * x);
// 0 -> 1 -> 0 over an action's life, with soft edges
const env = (t, a, len, r = 0.18) => (t < a || t > a + len ? 0 : ease(Math.min(1, (t - a) / r, (a + len - t) / r)));
const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const DevLive = forwardRef(function DevLive({ width: wDesk = 300, mobileWidth, lines = [], every = 4.2, pose, bubbleSide = "right", onClick, label = "Dev, the Appify mascot" }, ref) {
  const [width] = useState(() => (mobileWidth && window.innerWidth < 760 ? mobileWidth : wDesk));
  const box = useRef(null);
  const st = useRef({ acts: [], said: null, sayAt: -10, line: 0, look: 0, tilt: 0, nextBlink: 2, blinkAt: -1, visible: true, t0: performance.now() });
  const [, tick] = useState(0);
  const now = () => (performance.now() - st.current.t0) / 1000;

  const act = (type, delay = 0) => st.current.acts.push({ type, at: now() + delay });
  const say = (text) => { st.current.said = text; st.current.sayAt = now(); };
  useImperativeHandle(ref, () => ({ act, say }));

  useEffect(() => {
    const s = st.current;
    if (lines.length) { say(lines[0]); act("wave", 0.2); }
    const move = (e) => {
      const r = box.current?.getBoundingClientRect(); if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height * 0.25)) / (window.innerHeight / 2);
      s.lookTarget = Math.max(-1, Math.min(1, dx)); s.tiltTarget = Math.max(-1, Math.min(1, dx)) * 3 + dy * 1.5;
    };
    window.addEventListener("pointermove", move);
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; }, { threshold: 0.05 });
    if (box.current) io.observe(box.current);
    let raf;
    const loop = () => {
      const t = now();
      if (s.visible) {
        // cycle the lines, with a gesture on each new one
        if (lines.length > 1 && t - s.sayAt > every) {
          s.line = (s.line + 1) % lines.length; say(lines[s.line]);
          act(["point", "thumbs", "happy", "wave"][s.line % 4]);
        }
        if (t > s.nextBlink) { s.blinkAt = t; s.nextBlink = t + 2.2 + Math.random() * 2.8; }
        s.look += ((s.lookTarget ?? 0) - s.look) * 0.12;
        s.tilt += ((s.tiltTarget ?? 0) - s.tilt) * 0.08;
        s.acts = s.acts.filter((a) => t < a.at + (ACT_LEN[a.type] ?? 1.5));
        tick((n) => (n + 1) % 1e6);
      }
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop); else tick(1);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); io.disconnect(); };
  }, []);

  const s = st.current, t = now();
  const a = (type) => (pose === type ? 1 : s.acts.filter((x) => x.type === type).reduce((v, x) => Math.max(v, env(t, x.at, ACT_LEN[type])), 0));
  // speech: typed out, mouth moves while typing
  const typed = s.said ? s.said.slice(0, Math.floor((t - s.sayAt) * 32)) : "";
  const talking = s.said && typed.length < s.said.length;
  const open = talking ? 0.25 + 0.5 * Math.abs(Math.sin(t * 17)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0;
  const bt = t - s.blinkAt, blink = bt >= 0 && bt < 0.14 ? Math.sin((bt / 0.14) * Math.PI) : 0;
  const shock = a("shock"), happy = a("happy"), jumpE = s.acts.find((x) => x.type === "jump" && t >= x.at && t < x.at + ACT_LEN.jump);
  const jumpY = jumpE ? -Math.sin(((t - jumpE.at) / ACT_LEN.jump) * Math.PI) * width * 0.22 : 0;
  const lean = a("lean");
  const bob = talking ? -open * 2 - Math.abs(Math.sin(t * 9)) * 2 : Math.sin(t * 1.4) * 1.2;
  const face = {
    brow: 10 + 10 * a("thumbs") + 8 * a("point") - 6 * lean, lid: Math.max(0.12 * (1 - happy), blink), smile: Math.max(0.75, happy, a("thumbs")),
    look: reduced ? 4 : s.look * 9, shock, happy, wink: a("wink"), open,
  };
  const bubble = s.said && (
    <div className={`dev-bubble ${bubbleSide}`} aria-live="polite" style={{ opacity: typed ? 1 : 0, transform: `scale(${typed ? 1 : 0.8})` }}>
      {typed}<span className="caret" style={{ opacity: talking ? 1 : 0 }}>▍</span>
    </div>
  );
  return (
    <div className="dev-live" ref={box} style={{ width }} role="img" aria-label={label}
      onClick={() => { act("jump"); act("happy"); if (lines.length) { s.line = (s.line + 1) % lines.length; say(lines[s.line]); } onClick?.(); }}>
      {bubble}
      <div style={{ transform: `translateY(${jumpY}px) scale(${1 + lean * 0.04})`, transformOrigin: "50% 100%" }}>
        <Dev width={width} point={a("point")} wave={a("wave")} waveAng={Math.sin(t * 14) * 22} thumbs={a("thumbs")}
          tilt={s.tilt + Math.sin(t * 0.9) * 0.6 - lean * 3} bob={bob} {...face} />
      </div>
    </div>
  );
});
