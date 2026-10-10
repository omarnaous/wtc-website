import { Wordmark } from "./Brand.jsx";
import { CONTACT } from "../config.js";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot">
        <div><Wordmark height={34} color="#fff" spark="var(--iris)" /><p className="foot-slogan">Ideas, appified.</p></div>
        <div className="foot-links">
          <a href="#work">Motion</a><a href="#builds">Websites & apps</a><a href="#dev">Meet Dev</a><a href="#contact">Contact</a>
          <a href={CONTACT.instagram} target="_blank" rel="noreferrer">{CONTACT.instagramHandle}</a>
        </div>
        <div className="foot-fine">© {new Date().getFullYear()} Appify · {CONTACT.website}</div>
      </div>
    </footer>
  );
}
