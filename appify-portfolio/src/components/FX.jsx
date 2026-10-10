// Page-wide motion: scroll-reveal, the spark cursor, magnetic buttons, tilt cards, scroll progress.
import { useEffect, useRef } from "react";
import { Spark } from "./Brand.jsx";

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan(); const mo = new MutationObserver(scan); mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

export function useMagnetic() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e) => {
      const el = e.target.closest?.(".magnetic"), tilt = e.target.closest?.("[data-tilt]");
      document.querySelectorAll(".magnetic.pull").forEach((b) => { if (b !== el) { b.classList.remove("pull"); b.style.transform = ""; } });
      if (el) { const r = el.getBoundingClientRect(); el.classList.add("pull"); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`; }
      document.querySelectorAll("[data-tilt].tilting").forEach((t) => { if (t !== tilt) { t.classList.remove("tilting"); t.style.transform = ""; } });
      if (tilt) { const r = tilt.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; tilt.classList.add("tilting"); tilt.style.transform = `perspective(1100px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`; }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
}

export function CursorSpark() {
  const el = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = -100, y = -100, tx = -100, ty = -100, big = 0, tb = 0, r = 0, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; tb = e.target.closest?.("a,button,.clip,[data-tilt]") ? 1 : 0; };
    const loop = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22; big += (tb - big) * 0.15; r += 0.6 + big * 3;
      if (el.current) el.current.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) rotate(${r}deg) scale(${1 + big * 0.9})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move); raf = requestAnimationFrame(loop);
    document.documentElement.classList.add("has-spark");
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
  }, []);
  return <div className="cursor-spark" ref={el} aria-hidden="true"><Spark size={20} /></div>;
}

export function ScrollBar() {
  const el = useRef(null);
  useEffect(() => {
    const f = () => { const h = document.documentElement.scrollHeight - window.innerHeight; if (el.current) el.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`; };
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return <div className="scrollbar" ref={el} />;
}
