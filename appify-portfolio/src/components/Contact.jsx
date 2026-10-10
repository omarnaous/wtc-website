// The appointment box: pick a day and a time, say what you need, and it opens WhatsApp with the
// booking request already written. Nothing is stored or sent anywhere else.
import { useMemo, useRef, useState } from "react";
import { BOOKING, CONTACT, SERVICES, isPlaceholderNumber, waLink } from "../config.js";
import { Heading, WhatsAppIcon } from "./Brand.jsx";
import { DevLive } from "./DevLive.jsx";

const fmtDay = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (s) => { const [h, m] = s.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

export function Contact() {
  const days = useMemo(() => {
    const out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (let i = 1; out.length < BOOKING.days; i++) {
      const x = new Date(d); x.setDate(d.getDate() + i);
      if (!BOOKING.closedWeekdays.includes(x.getDay())) out.push(x);
    }
    return out;
  }, []);
  const [form, setForm] = useState({ name: "", business: "", services: [], day: null, time: null, notes: "" });
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const dev = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (s) => set("services", form.services.includes(s) ? form.services.filter((x) => x !== s) : [...form.services, s]);

  // The button is a real link (not window.open, which pop-up blockers and sandboxed frames refuse):
  // its href is the WhatsApp message for whatever is filled in right now.
  const problem = !form.name.trim() ? "What's your name?" : form.day == null || !form.time ? "Pick a day and a time." : "";
  const message = problem ? "" : [
    "Hi Appify! I'd like to book a call.",
    `• Name: ${form.name.trim()}`,
    form.business.trim() && `• Business: ${form.business.trim()}`,
    form.services.length && `• Interested in: ${form.services.join(", ")}`,
    `• Preferred time: ${fmtDay(days[form.day])}, ${fmtTime(form.time)}`,
    form.notes.trim() && `• Notes: ${form.notes.trim()}`,
  ].filter(Boolean).join("\n");
  const book = (e) => {
    if (problem) { e.preventDefault(); setErr(problem); return; }
    setErr(""); setSent(true);
    dev.current?.act("thumbs"); dev.current?.act("jump"); dev.current?.say("Sent! We'll confirm on WhatsApp.");
  };

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <Heading kicker="04 · Contact" dark>Let's make your brand <span className="uv-l">move.</span></Heading>
          <p className="contact-text" data-reveal>Pick a time for a quick call. The box writes the WhatsApp message for you; we reply and confirm the slot there.</p>
          <div className="contact-links" data-reveal>
            <a className="btn btn-wa magnetic" href={waLink("Hi Appify! I'd like to talk about a project.")} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat now</a>
            <a className="btn btn-ghost-l magnetic" href={CONTACT.instagram} target="_blank" rel="noreferrer">Instagram {CONTACT.instagramHandle}</a>
          </div>
          <div className="contact-dev"><DevLive ref={dev} width={210} lines={["Pick a time, I'll tell the team.", "Mornings or afternoons, your call.", "We reply fast. Promise."]} every={5.5} bubbleSide="right" /></div>
        </div>
        <form className="book" onSubmit={(e) => e.preventDefault()} data-reveal noValidate>
          <div className="book-head"><span className="book-dot" /> Book a call</div>
          <div className="row2">
            <label>Your name<input id="book-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Omar" autoComplete="name" /></label>
            <label>Business <span className="opt">optional</span><input id="book-business" value={form.business} onChange={(e) => set("business", e.target.value)} placeholder="Brand or company" /></label>
          </div>
          <fieldset><legend>What do you need?</legend>
            <div className="chips">{SERVICES.map((s) => <button type="button" key={s} className={`chip ${form.services.includes(s) ? "on" : ""}`} onClick={() => toggle(s)}>{s}</button>)}</div>
          </fieldset>
          <fieldset><legend>Pick a day</legend>
            <div className="days">{days.map((d, i) => (
              <button type="button" key={i} className={`day ${form.day === i ? "on" : ""}`} onClick={() => set("day", i)}>
                <span>{d.toLocaleDateString("en-GB", { weekday: "short" })}</span><b>{d.getDate()}</b><span>{d.toLocaleDateString("en-GB", { month: "short" })}</span>
              </button>))}
            </div>
          </fieldset>
          <fieldset><legend>Pick a time <span className="opt">Lebanon time</span></legend>
            <div className="slots">{BOOKING.slots.map((s) => <button type="button" key={s} className={`chip ${form.time === s ? "on" : ""}`} onClick={() => set("time", s)}>{fmtTime(s)}</button>)}</div>
          </fieldset>
          <label>Anything else? <span className="opt">optional</span><textarea id="book-notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="A link, a deadline, an idea…" /></label>
          {err && <div className="err" role="alert">{err}</div>}
          {isPlaceholderNumber && <div className="warn">Placeholder WhatsApp number: set yours in src/config.js before launch.</div>}
          <a className="btn btn-wa btn-lg btn-block magnetic book-go" href={problem ? "#contact" : waLink(message)} target="_blank" rel="noreferrer" onClick={book}><WhatsAppIcon /> {sent ? "Open WhatsApp again" : "Book on WhatsApp"}</a>
          <p className="fine">Opens WhatsApp with your request written out. Nothing is stored on this site.</p>
        </form>
      </div>
    </section>
  );
}
