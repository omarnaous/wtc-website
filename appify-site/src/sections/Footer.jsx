import { Wordmark } from "../components/Logo.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <Wordmark height={30} />
        <p className="muted">Websites · Mobile apps · Motion graphics · AI agents</p>
        <div className="footer__links">
          <a href="https://instagram.com/appifylb" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <p className="footer__fine muted">© {new Date().getFullYear()} Appify. Motion on this page is rendered live with Remotion.</p>
      </div>
    </footer>
  );
}
