import { useEffect, useState } from "react";
import { Wordmark } from "./Brand.jsx";

const LINKS = [["#work", "Motion"], ["#builds", "Websites & apps"], ["#dev", "Meet Dev"], ["#contact", "Contact"]];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 24);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`nav ${solid ? "solid" : ""} ${open ? "open" : ""}`}>
      <a href="#top" className="nav-logo" aria-label="Appify, back to top"><Wordmark height={26} /></a>
      <nav className="nav-links" onClick={() => setOpen(false)}>
        {LINKS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <a href="#contact" className="btn btn-uv nav-cta magnetic">Book a call</a>
      <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
    </header>
  );
}
