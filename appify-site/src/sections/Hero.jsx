import { useEffect, useState } from "react";
import LoopPlayer from "../components/LoopPlayer.jsx";
import HeroStage, { HERO } from "../remotion/HeroStage.jsx";

const ROTATE = ["websites", "mobile apps", "motion graphics", "AI agents"];

export default function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % ROTATE.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow"><span className="live" />Software studio · Booking projects for 2026</p>
          <h1 className="hero__title">
            We design and build
            <span className="rotator" aria-live="polite">
              {ROTATE.map((w, k) => (
                <span key={w} className={`rotator__word ${k === i ? "is-on" : ""}`} aria-hidden={k !== i}>{w}</span>
              ))}
            </span>
            that move.
          </h1>
          <p className="hero__lead">
            Appify is a small studio that ships custom websites, mobile apps, motion graphics and AI agents.
            One team, from first sketch to launch day.
          </p>
          <div className="hero__ctas">
            <a href="#contact" className="btn btn--primary">Book a demo <span aria-hidden="true">→</span></a>
            <a href="#work" className="btn btn--ghost">See the work</a>
          </div>
          <ul className="caps" aria-label="What we do">
            <li><b>Web</b>Next.js, Astro, headless CMS</li>
            <li><b>Mobile</b>React Native, Flutter</li>
            <li><b>Motion</b>Remotion, After Effects</li>
            <li><b>AI</b>Agents, chat, automations</li>
          </ul>
        </div>
        <div className="hero__stage">
          <LoopPlayer component={HeroStage} {...HERO} restFrame={150} label="Animated illustration: the Appify mark surrounded by a website, a phone app, an AI chat and a motion timeline" />
          <p className="stage__caption"><span>Live render</span> Remotion · 1000×1000 · 30 fps</p>
        </div>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>Websites ✦ Mobile apps ✦ Motion graphics ✦ AI agents ✦ Brand systems ✦ Product design ✦ </span>
          ))}
        </div>
      </div>
    </section>
  );
}
