import { useState } from "react";
import LoopPlayer from "../components/LoopPlayer.jsx";
import { PROJECTS } from "../projects.js";

const FILTERS = [["all", "All"], ["app", "Apps"], ["web", "Websites"]];

export default function Work() {
  const [filter, setFilter] = useState("all");
  const list = PROJECTS.filter((p) => filter === "all" || p.kind === filter);

  return (
    <section id="work" className="section">
      <div className="wrap">
        <header className="section__head">
          <p className="eyebrow">Scene 02 · Work</p>
          <h2 className="section__title">Apps and websites, shown working.</h2>
          <p className="section__lead">Each preview below is animated in code, the same way we build product demos for clients. These are studio concepts; client launches join them as they ship.</p>
          <div className="filters" role="tablist" aria-label="Filter projects">
            {FILTERS.map(([k, label]) => (
              <button key={k} role="tab" id={`filter-${k}`} aria-selected={filter === k} className={`chip ${filter === k ? "is-on" : ""}`} onClick={() => setFilter(k)}>
                {label}<span className="chip__n">{k === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.kind === k).length}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="work">
          {list.map((p, idx) => (
            <article key={p.id} className={`project ${idx % 2 ? "project--flip" : ""}`}>
              <div className="project__media">
                <LoopPlayer component={p.comp} {...p.meta} label={`Animated preview of ${p.title}`} />
              </div>
              <div className="project__info">
                <div className="project__tags">
                  <span className="tag">{p.kind === "app" ? "Mobile app" : "Website"}</span>
                  {p.concept && <span className="tag tag--line">Concept</span>}
                </div>
                <h3 className="project__title">{p.title}</h3>
                <p className="project__sum">{p.summary}</p>
                <ul className="stack" aria-label="Built with">
                  {p.stack.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
