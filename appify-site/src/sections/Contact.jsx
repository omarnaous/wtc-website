import { useMemo, useState } from "react";

const SERVICES = ["Website", "Mobile app", "Motion graphics", "AI agent"];
const TIMES = ["10:00", "11:30", "13:00", "15:30", "17:00"];
const IG = "appifylb";
// The Netlify build posts to Netlify Forms. The single-file preview build cannot send anything.
const CAN_SEND = import.meta.env.MODE !== "single";

function nextWeekdays(n) {
  const out = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
  }
  return out;
}
const fmtDay = (d) => d.toLocaleDateString("en-GB", { weekday: "short" });
const fmtLong = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const encode = (data) => Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");

export default function Contact() {
  const days = useMemo(() => nextWeekdays(10), []);
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "your time zone", []);
  const [services, setServices] = useState(["Website"]);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("11:30");
  const [form, setForm] = useState({ name: "", email: "", company: "", notes: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | preview | error
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const toggle = (s) => setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Add your name so we know who we're meeting.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter an email like name@company.com.";
    if (!services.length) errs.services = "Pick at least one thing you want to build.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!CAN_SEND) { setStatus("preview"); return; }
    setStatus("sending");
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "demo-booking", ...form, services: services.join(", "), date: fmtLong(days[day]), time, timezone: tz }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  async function copyHandle() {
    try { await navigator.clipboard.writeText(`@${IG}`); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { /* text stays selectable */ }
  }

  const summary = `${fmtLong(days[day])} · ${time} · ${services.join(" + ") || "Pick a service"}`;
  const done = status === "sent" || status === "preview";

  return (
    <section id="contact" className="section section--contact">
      <div className="wrap contact">
        <div className="contact__intro">
          <p className="eyebrow">Scene 04 · Contact</p>
          <h2 className="section__title">Book a 30-minute demo.</h2>
          <p className="section__lead">Tell us what you're building. We'll come back with a live walkthrough of how we'd design it, what it costs and how long it takes.</p>
          <ol className="steps">
            <li><b>Pick a slot</b><span>Choose a weekday and time that works for you.</span></li>
            <li><b>We confirm</b><span>You get a calendar invite within one business day.</span></li>
            <li><b>See your demo</b><span>A clickable concept, a timeline and a fixed quote.</span></li>
          </ol>
          <div className="dm">
            <span>Prefer Instagram?</span>
            <code className="dm__handle">@{IG}</code>
            <button type="button" id="copy-ig" className="btn btn--sm btn--ghost" onClick={copyHandle}>{copied ? "Copied" : "Copy"}</button>
            <a className="dm__link" href={`https://instagram.com/${IG}`} target="_blank" rel="noreferrer">Open profile ↗</a>
          </div>
        </div>

        <div className="booking" aria-live="polite">
          {done ? (
            <div className="booking__done">
              <div className="booking__check" aria-hidden="true">✓</div>
              <h3>{status === "sent" ? "Request received" : "Preview only"}</h3>
              <p className="booking__summary">{summary}</p>
              <p className="muted">
                {status === "sent"
                  ? `Thanks, ${form.name.split(" ")[0]}. We'll email ${form.email} to confirm the slot.`
                  : "This preview can't send requests. On the live site this goes straight to the Appify inbox."}
              </p>
              <button type="button" id="booking-again" className="btn btn--ghost" onClick={() => setStatus("idle")}>Edit request</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <fieldset className="field">
                <legend>What are you building?</legend>
                <div className="opts">
                  {SERVICES.map((s, k) => (
                    <button type="button" id={`svc-${k}`} key={s} aria-pressed={services.includes(s)} className={`chip ${services.includes(s) ? "is-on" : ""}`} onClick={() => toggle(s)}>{s}</button>
                  ))}
                </div>
                {errors.services && <p className="err">{errors.services}</p>}
              </fieldset>

              <fieldset className="field">
                <legend>Pick a day</legend>
                <div className="days">
                  {days.map((d, k) => (
                    <button type="button" id={`day-${k}`} key={k} aria-pressed={day === k} className={`day ${day === k ? "is-on" : ""}`} onClick={() => setDay(k)} aria-label={fmtLong(d)}>
                      <span className="day__w">{fmtDay(d)}</span>
                      <span className="day__d">{d.getDate()}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="field">
                <legend>Pick a time <span className="muted">· {tz.replace("_", " ")}</span></legend>
                <div className="opts">
                  {TIMES.map((t, k) => (
                    <button type="button" id={`time-${k}`} key={t} aria-pressed={time === t} className={`chip chip--time ${time === t ? "is-on" : ""}`} onClick={() => setTime(t)}>{t}</button>
                  ))}
                </div>
              </fieldset>

              <div className="inputs">
                <label className="input">
                  <span>Name</span>
                  <input id="bk-name" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} />
                  {errors.name && <em className="err">{errors.name}</em>}
                </label>
                <label className="input">
                  <span>Email</span>
                  <input id="bk-email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" aria-invalid={!!errors.email} />
                  {errors.email && <em className="err">{errors.email}</em>}
                </label>
                <label className="input input--wide">
                  <span>Company <i className="muted">optional</i></span>
                  <input id="bk-company" value={form.company} onChange={set("company")} placeholder="Company or project name" autoComplete="organization" />
                </label>
                <label className="input input--wide">
                  <span>What should the demo cover? <i className="muted">optional</i></span>
                  <textarea id="bk-notes" rows="3" value={form.notes} onChange={set("notes")} placeholder="A booking app for our clinic, with WhatsApp reminders…" />
                </label>
              </div>

              <div className="booking__foot">
                <p className="booking__summary">{summary}</p>
                <button className="btn btn--primary" id="bk-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Request demo"}
                </button>
              </div>
              {status === "error" && <p className="err">We couldn't send that. Check your connection and try again, or DM @{IG} on Instagram.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
