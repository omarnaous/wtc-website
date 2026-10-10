// Site intro: the Appify logo reveal plays live (Remotion Player), then the curtain lifts.
// Once per session, skippable, and skipped entirely for reduced-motion visitors.
import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { Main as Reveal } from "../remotion/Main.jsx";
import { FPS, DURATION } from "../remotion/timing.js";
import { SERVICES } from "../config.js";

const END = 214; // the logo, slogan, url and tags are all in by here
const KEY = "appify-intro";

export function Intro({ onDone }) {
  const seen = (() => { try { return sessionStorage.getItem(KEY); } catch { return null; } })();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [phase, setPhase] = useState(seen || reduced ? "gone" : "play");
  const player = useRef(null);
  const portrait = window.innerHeight > window.innerWidth;
  const [w, h] = portrait ? [1080, 1920] : [1080, 1350];

  const finish = () => {
    if (phase !== "play") return;
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    setPhase("lift");
    setTimeout(() => { setPhase("gone"); onDone?.(); }, 900);
  };
  useEffect(() => {
    if (phase === "gone") { onDone?.(); return; }
    document.documentElement.style.overflow = "hidden";
    const p = player.current;
    const onFrame = (e) => { if (e.detail.frame >= END) finish(); };
    p?.addEventListener("frameupdate", onFrame);
    const safety = setTimeout(finish, 11000);   // never trap anyone behind the intro
    return () => { p?.removeEventListener("frameupdate", onFrame); clearTimeout(safety); document.documentElement.style.overflow = ""; };
  }, [phase === "gone"]);
  if (phase === "gone") return null;
  return (
    <div className={`intro ${phase}`} aria-hidden="true">
      <Player ref={player} component={Reveal} inputProps={{ slogan: "Ideas, appified.", url: "www.appify-lb.com", tags: SERVICES }}
        durationInFrames={DURATION} fps={FPS} compositionWidth={w} compositionHeight={h} autoPlay controls={false}
        clickToPlay={false} style={{ width: portrait ? "100vw" : `min(100vw, ${(100 * w) / h}vh)`, aspectRatio: `${w}/${h}` }} />
      <button className="intro-skip" onClick={finish}>Skip intro →</button>
    </div>
  );
}
