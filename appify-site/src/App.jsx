import Nav from "./components/Nav.jsx";
import Timecode from "./components/Timecode.jsx";
import Hero from "./sections/Hero.jsx";
import Work from "./sections/Work.jsx";
import Motion from "./sections/Motion.jsx";
import Contact from "./sections/Contact.jsx";
import Footer from "./sections/Footer.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Motion />
        <Contact />
      </main>
      <Footer />
      <Timecode />
    </>
  );
}
