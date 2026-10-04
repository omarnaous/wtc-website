import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import Reel, { CHAPTERS, REEL } from "../remotion/Reel.jsx";

const pad = (n) => String(n).padStart(2, "0");
const tc = (f) => `${pad(Math.floor(f / REEL.fps / 60))}:${pad(Math.floor(f / REEL.fps) % 60)}:${pad(f % REEL.fps)}`;

export default function Motion() {
  const ref = useRef(null);
  const box = useRef(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onFrame = (e) => setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("seeked", onFrame);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) p.pause();
      else if (!reduced && !io.started) { io.started = true; p.play(); }
    }, { threshold: 0.4 });
    io.observe(box.current);
    return () => {
      io.disconnect();
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("seeked", onFrame);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
    };
  }, []);

  const current = CHAPTERS.findLastIndex((c) => frame >= c.from);
  const seek = (f) => { ref.current?.seekTo(f); setFrame(f); };

  return (
    <section id="motion" className="section section--motion">
      <div className="wrap">
        <header className="section__head">
          <p className="eyebrow">Scene 03 · Motion</p>
          <h2 className="section__title">Motion graphics, written in code.</h2>
          <p className="section__lead">This reel is not a video file. Every frame is a React component rendered live in your browser with Remotion, so the same scenes can be re-cut with your brand, your copy and your data.</p>
        </header>

        <div className="reel" ref={box}>
          <div className="reel__screen">
            <Player
              ref={ref}
              component={Reel}
              durationInFrames={REEL.durationInFrames}
              compositionWidth={REEL.width}
              compositionHeight={REEL.height}
              fps={REEL.fps}
              loop
              controls={false}
              initialFrame={100}
              clickToPlay
              acknowledgeRemotionLicense
              style={{ width: "100%", aspectRatio: "16 / 9" }}
            />
          </div>

          <div className="reel__bar">
            <button id="reel-play" className="reel__play" onClick={() => ref.current?.toggle()} aria-label={playing ? "Pause reel" : "Play reel"}>
              {playing ? (
                <svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" /></svg>
              )}
            </button>
            <span className="reel__tc">{tc(frame)}</span>
            <div className="reel__track">
              {CHAPTERS.map((c, k) => (
                <span key={c.name} className="reel__seg" style={{ flexGrow: c.dur }}>
                  <span className="reel__fill" style={{ width: `${Math.min(100, Math.max(0, ((frame - c.from) / c.dur) * 100))}%` }} />
                </span>
              ))}
              <input id="reel-scrub" type="range" min="0" max={REEL.durationInFrames - 1} value={frame} onChange={(e) => seek(+e.target.value)} aria-label="Scrub reel" />
            </div>
            <span className="reel__tc reel__tc--dim">{tc(REEL.durationInFrames)}</span>
          </div>

          <ol className="chapters">
            {CHAPTERS.map((c, k) => (
              <li key={c.name}>
                <button id={`chapter-${k}`} className={`chapter ${k === current ? "is-on" : ""}`} onClick={() => { seek(c.from); ref.current?.play(); }}>
                  <span className="chapter__n">{pad(k + 1)}</span>
                  <span className="chapter__name">{c.name}</span>
                  <span className="chapter__len">{(c.dur / REEL.fps).toFixed(1)}s</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
