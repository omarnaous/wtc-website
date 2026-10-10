import { useEffect, useState } from "react";
import { BUILDS } from "../work.js";
import { Heading } from "./Brand.jsx";

function Slideshow({ shots }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % shots.length), 2600); return () => clearInterval(t); }, [shots.length]);
  return (
    <div className="slides">
      {shots.map((s, k) => <img key={s} src={s} alt="" className={k === i ? "on" : ""} loading="lazy" />)}
    </div>
  );
}

function Browser({ build }) {
  return (
    <div className="browser" data-tilt>
      <div className="browser-bar"><i /><i /><i /><span className="browser-url">{build.urlLabel}</span></div>
      <Slideshow shots={build.shots} />
    </div>
  );
}

function PhoneSoon({ title }) {
  return (
    <div className="phone" data-tilt>
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="soon-title">{title}</div>
        <div className="soon-bars"><i /><i /><i /></div>
        <div className="soon-pill">Case study coming soon</div>
      </div>
    </div>
  );
}

export function Builds() {
  return (
    <section className="builds" id="builds">
      <div className="wrap">
        <Heading kicker="02 · Websites & mobile apps">Built to sell, <span className="uv">not just to sit there.</span></Heading>
        {BUILDS.map((b, n) => (
          <article key={b.id} className={`build ${n % 2 ? "flip" : ""} ${b.soon ? "soon" : ""}`} data-reveal>
            <div className="build-media">{b.shots.length ? <Browser build={b} /> : <PhoneSoon title={b.title} />}
              {b.shotsNote && <div className="shots-note">{b.shotsNote}</div>}</div>
            <div className="build-copy">
              <div className="clip-tag static light">{b.kind}{b.place ? ` · ${b.place}` : ""}</div>
              <h3>{b.title}</h3>
              <p className="lead">{b.blurb}</p>
              {b.features.length > 0 && <ul className="feats">{b.features.map((f, i) => <li key={f} style={{ "--d": i }}>{f}</li>)}</ul>}
              {b.stack.length > 0 && <div className="stack">{b.stack.map((s) => <span key={s}>{s}</span>)}</div>}
              {b.url && <a className="btn btn-ink magnetic" href={b.url} target="_blank" rel="noreferrer">Visit {b.urlLabel} ↗</a>}
              {b.soon && <p className="muted">Screens and the full story are on the way.</p>}
            </div>
          </article>
        ))}
        <a href="#contact" className="build-next" data-reveal>
          <span className="kicker">Next up</span>
          <span className="next-big">Your website or app <span className="uv">could be here.</span></span>
          <span className="btn btn-uv">Let's talk →</span>
        </a>
      </div>
    </section>
  );
}
