import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrub-drawable dash tween for thread paths. Writes stroke-dashoffset
 * directly (unitless, pathLength=1) via a proxy — GSAP's CSS handling of
 * dashoffset on runtime-generated paths degrades to a midpoint snap, so we
 * don't let it near the property.
 */
export const drawThread = (
  targets: ArrayLike<Element>,
  vars: gsap.TweenVars = {},
) => {
  const els = Array.from(targets) as SVGPathElement[];
  const state = { v: 1 };
  let last = -1;
  els.forEach((p) => (p.style.strokeDashoffset = "1"));
  return gsap.to(state, {
    v: 0,
    ease: "none",
    ...vars,
    onUpdate() {
      // quantize (~1.5px steps on a typical segment) and skip redundant
      // writes — every dashoffset write invalidates paint on a large SVG
      const q = Math.round(state.v * 2000) / 2000;
      if (q === last) return;
      last = q;
      const s = String(q);
      els.forEach((p) => (p.style.strokeDashoffset = s));
    },
  });
};
