import { useEffect, useState } from "react";

const SCENES = [
  ["top", "Hero"],
  ["work", "Work"],
  ["motion", "Motion"],
  ["contact", "Contact"],
];
const FPS = 30;
const pad = (n) => String(n).padStart(2, "0");

// Editing-suite HUD: page scroll shown as a timecode at 30 fps.
export default function Timecode() {
  const [state, setState] = useState({ tc: "00:00:00:00", scene: 1, name: "Hero" });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const frames = Math.round(window.scrollY / 6);
      const s = Math.floor(frames / FPS);
      const tc = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames % FPS)}`;
      let scene = 1;
      SCENES.forEach(([id], i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) scene = i + 1;
      });
      setState({ tc, scene, name: SCENES[scene - 1][1] });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="tc" aria-hidden="true">
      <span className="tc__rec" />
      <span>SC {pad(state.scene)} · {state.name}</span>
      <span className="tc__time">{state.tc}</span>
      <span className="tc__fps">{FPS} fps</span>
    </div>
  );
}
