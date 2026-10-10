// Motion graphics: the featured client film, then a filmstrip of the rest. On desktop the strip is
// driven by vertical scroll (the section pins and slides sideways); on touch screens it swipes.
import { useEffect, useRef, useState } from "react";
import { MOTION } from "../work.js";
import { Heading } from "./Brand.jsx";

function useInView(ref, threshold = 0.5) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return v;
}

function Clip({ item, onOpen, className = "" }) {
  const box = useRef(null), vid = useRef(null);
  const inView = useInView(box, 0.55);
  useEffect(() => {
    const v = vid.current; if (!v) return;
    if (inView) v.play().catch(() => {}); else v.pause();
  }, [inView]);
  return (
    <button ref={box} className={`clip ${className}`} style={{ aspectRatio: item.ratio }} onClick={() => onOpen(item)} aria-label={`Play ${item.title} with sound`}>
      <video ref={vid} src={item.video} poster={item.poster} muted loop playsInline preload="metadata" />
      <span className="clip-tag">{item.tag}</span>
      <span className="clip-play"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor" /></svg> Watch with sound</span>
      <span className="clip-len">{item.length}</span>
    </button>
  );
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = ""; };
  }, [item]);
  if (!item) return null;
  const tall = item.ratio === "9/16";
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-label={item.title}>
      <div className={`lb-frame ${tall ? "tall" : ""}`} onClick={(e) => e.stopPropagation()} style={{ aspectRatio: item.ratio }}>
        <video src={item.video} poster={item.poster} controls autoPlay playsInline />
      </div>
      <div className="lb-meta" onClick={(e) => e.stopPropagation()}>
        <div className="clip-tag static">{item.tag}</div>
        <h3>{item.title}</h3>
        <p>{item.client !== "Appify" ? <b>{item.client}. </b> : null}{item.blurb}</p>
      </div>
      <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}

export function MotionWork() {
  const [open, setOpen] = useState(null);
  const featured = MOTION.find((m) => m.featured), rest = MOTION.filter((m) => !m.featured);
  const pin = useRef(null), track = useRef(null);
  const [x, setX] = useState(0);
  const [pinH, setPinH] = useState(null);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px) and (pointer: fine)");
    const measure = () => {
      if (!wide.matches || !track.current) { setPinH(null); setX(0); return; }
      const extra = track.current.scrollWidth - window.innerWidth;
      setPinH(window.innerHeight + Math.max(0, extra));
    };
    const onScroll = () => {
      if (!wide.matches || !pin.current || !track.current) return;
      const r = pin.current.getBoundingClientRect();
      const extra = track.current.scrollWidth - window.innerWidth;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      setX(-p * Math.max(0, extra));
    };
    measure(); onScroll();
    window.addEventListener("resize", measure); window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(measure, 600);
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, []);
  return (
    <section className="work dark" id="work">
      <div className="wrap">
        <Heading kicker="01 · Motion graphics" dark>Ads, reels and logo reveals that <span className="uv-l">stop the scroll.</span></Heading>
        <div className="featured" data-reveal>
          <Clip item={featured} onOpen={setOpen} className="big" />
          <div className="featured-meta">
            <div className="clip-tag static">{featured.tag}</div>
            <h3>{featured.title}</h3>
            <div className="client">{featured.client}</div>
            <p>{featured.blurb}</p>
            <button className="btn btn-uv magnetic" onClick={() => setOpen(featured)}>▶ Watch with sound</button>
          </div>
        </div>
      </div>
      <div className="pin" ref={pin} style={pinH ? { height: pinH } : undefined}>
        <div className={`pin-inner ${pinH ? "sticky" : ""}`}>
          <div className="strip-head wrap"><span className="kicker light">More motion · Appify originals</span><span className="strip-hint">{pinH ? "Keep scrolling →" : "Swipe →"}</span></div>
          <div className="strip" ref={track} style={{ transform: `translate3d(${x}px,0,0)` }}>
            {rest.map((item, i) => (
              <figure key={item.id} className="strip-item" style={{ "--d": i }} data-reveal>
                <Clip item={item} onOpen={setOpen} />
                <figcaption><b>{item.title}</b><span>{item.blurb}</span></figcaption>
              </figure>
            ))}
            <a href="#contact" className="strip-item strip-cta">
              <span className="cta-big">Your brand,<br />in motion.</span>
              <span className="btn btn-uv">Book a call →</span>
            </a>
          </div>
        </div>
      </div>
      <Lightbox item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
