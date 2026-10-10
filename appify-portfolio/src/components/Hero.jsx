import { DevLive } from "./DevLive.jsx";
import { Spark } from "./Brand.jsx";
import { SERVICES } from "../config.js";

const LINES = ["Hey! I'm Dev 👋", "We make brands move.", "Motion, websites, apps. Pick one.", "The good stuff is below 👇", "Psst… you can click me."];

export function Hero({ ready }) {
  return (
    <section className={`hero ${ready ? "go" : ""}`} id="top">
      <div className="hero-copy">
        <div className="kicker hero-kick"><Spark size={16} /> Creative studio · Lebanon</div>
        <h1 className="hero-title" aria-label="Ideas, appified.">
          <span className="line"><span className="w" style={{ "--d": 0 }}>Ideas,</span></span>
          <span className="line"><span className="w uv" style={{ "--d": 1 }}>appified.</span></span>
        </h1>
        <p className="hero-sub">We make motion graphics, websites, mobile apps and AI agents. Things people actually stop scrolling for.</p>
        <div className="hero-ctas">
          <a href="#contact" className="btn btn-uv btn-lg magnetic">Book a call on WhatsApp</a>
          <a href="#work" className="btn btn-ghost btn-lg magnetic">See the work ↓</a>
        </div>
      </div>
      <div className="hero-stage">
        <div className="stage-glow" />
        <Spark size={520} className="stage-spark" color="rgba(91,43,255,.10)" />
        {SERVICES.map((s, i) => <span key={s} className={`orbit o${i}`} style={{ "--i": i }}>{s}</span>)}
        <div className="hero-dev"><DevLive width={300} mobileWidth={205} lines={LINES} bubbleSide="right" /></div>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div key={k} className="marquee-set">
              {[...SERVICES, "Framer Motion", "Logo reveals", "Launch ads"].map((s) => <span key={s}>{s}<Spark size={14} /></span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
