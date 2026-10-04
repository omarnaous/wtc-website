import { Wordmark } from "./Logo.jsx";

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav__in">
        <a href="#top" className="nav__logo" aria-label="Appify home">
          <Wordmark height={26} />
        </a>
        <nav className="nav__links" aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#motion">Motion</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#contact" className="btn btn--sm btn--primary">Book a demo</a>
      </div>
    </header>
  );
}
