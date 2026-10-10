import { useState } from "react";
import { Intro } from "./components/Intro.jsx";
import { Nav } from "./components/Nav.jsx";
import { Hero } from "./components/Hero.jsx";
import { MotionWork } from "./components/MotionWork.jsx";
import { Builds } from "./components/Builds.jsx";
import { MeetDev } from "./components/MeetDev.jsx";
import { Contact } from "./components/Contact.jsx";
import { Footer } from "./components/Footer.jsx";
import { CursorSpark, ScrollBar, useMagnetic, useReveal } from "./components/FX.jsx";

export default function App() {
  const [ready, setReady] = useState(false);
  useReveal(); useMagnetic();
  return (
    <>
      <Intro onDone={() => setReady(true)} />
      <ScrollBar />
      <CursorSpark />
      <Nav />
      <main>
        <Hero ready={ready} />
        <MotionWork />
        <Builds />
        <MeetDev />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
