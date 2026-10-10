import { useRef } from "react";
import { DevLive } from "./DevLive.jsx";
import { Heading, Mark } from "./Brand.jsx";

const POSES = [["wave", "👋 Wave"], ["point", "👉 Point"], ["thumbs", "👍 Thumbs up"], ["shock", "😱 Plot twist"], ["happy", "😄 Laugh"], ["wink", "😉 Wink"], ["jump", "⤴ Jump"]];
const SAYS = { wave: "Hi there!", point: "Look at that.", thumbs: "Love it.", shock: "Wait… what?!", happy: "Ha! Good one.", wink: "Our secret.", jump: "Wheee!" };

export function MeetDev() {
  const dev = useRef(null);
  const play = (p) => { dev.current?.act(p); dev.current?.say(SAYS[p]); };
  return (
    <section className="meet" id="dev">
      <div className="wrap meet-grid">
        <div className="meet-copy">
          <Heading kicker="03 · The brand">A spark, and <span className="uv">a guy named Dev.</span></Heading>
          <div className="brand-row" data-reveal>
            <div className="mark-box"><Mark size={120} /></div>
            <p>The ring and the stem make the <b>a</b>. The spark is the idea, and it ends up as the dot on the <b>i</b>. Every reveal we make starts with it.</p>
          </div>
          <p className="meet-text" data-reveal>Dev is the voice of every Appify reel. He points at things, reacts to plot twists, and takes the emotional damage so your brand doesn't. Go on, make him do something:</p>
          <div className="poses" data-reveal>
            {POSES.map(([p, label]) => <button key={p} className="chip" onClick={() => play(p)}>{label}</button>)}
          </div>
        </div>
        <div className="meet-stage" data-reveal>
          <div className="meet-floor" />
          <DevLive ref={dev} width={330} mobileWidth={230} lines={["I'm Dev. Nice to meet you.", "Try the buttons, I'll do anything.", "Except boring content."]} every={5} bubbleSide="left" />
        </div>
      </div>
    </section>
  );
}
