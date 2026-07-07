"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/anim";
import { lenisRef } from "@/lib/lenis";

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return;

    const lenis = new Lenis({ duration: 1.1, autoRaf: false });
    lenisRef.current = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* the drafting grid drifts almost imperceptibly against the content —
       fixed element + transform, driven by rAF, so it costs nothing and
       pauses with the tab */
    const drift = gsap.to(".sheet-grid", {
      y: -72,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 1 },
    });

    /* stage heights and fonts land after hydration; re-measure once settled */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      drift.scrollTrigger?.kill();
      drift.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
