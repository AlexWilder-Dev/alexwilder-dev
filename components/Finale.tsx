"use client";

import { useEffect, useRef } from "react";
import { drawThread, gsap, prefersReduced } from "@/lib/anim";
import type { Pt } from "@/lib/sketch";
import { threadX } from "@/lib/thread";
import ThreadSeg from "./ThreadSeg";

/* final thread segment: down the margin, hooks under the portrait as its
   underline, sweeps across, and terminates exactly at the seal — where the
   pen lifts */
const finaleAnchors = (w: number, h: number, root: HTMLElement): Pt[] => {
  const tx = threadX(w);
  const rr = root.getBoundingClientRect();
  const rel = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height };
  };
  const pEl = root.querySelector('[data-thread="portrait"]');
  const sEl = root.querySelector('[data-thread="seal"] .seal');
  if (!pEl || !sEl)
    return [
      { x: tx, y: 0 },
      { x: tx, y: h },
    ];
  const p = rel(pEl);
  const s = rel(sEl);
  const head: Pt[] = [
    { x: tx, y: 0 },
    { x: tx, y: p.y + p.h * 0.4 },
    { x: p.x - 24, y: p.y + p.h - 30 },
    { x: p.x + 8, y: p.y + p.h + 16 }, // the portrait underline
    { x: p.x + p.w + 8, y: p.y + p.h + 6 },
  ];
  if (w < 768) {
    // text is near full-width on mobile: hug the screen edges instead
    return [
      ...head,
      { x: w - 14, y: p.y + p.h + (s.y - p.y - p.h) * 0.45 },
      { x: w - 12, y: s.y + s.h * 0.5 },
      { x: w - 20, y: s.y + s.h + 200 },
      { x: tx + 10, y: s.y + s.h + 210 },
      { x: tx + 2, y: s.y + s.h * 0.85 },
      { x: s.x - 8, y: s.y + s.h * 0.62 },
    ];
  }
  // down the open right margin, sweep under the reassurance line, then
  // up the left margin — the pen lifts at the seal's edge
  return [
    ...head,
    { x: w * 0.72, y: p.y + p.h + (s.y - p.y - p.h) * 0.5 },
    { x: w * 0.78, y: s.y - 56 },
    { x: w * 0.72, y: s.y + s.h + 110 },
    { x: tx + 14, y: s.y + s.h + 100 },
    { x: tx + 4, y: s.y + s.h * 0.75 },
    { x: s.x - 10, y: s.y + s.h * 0.6 },
  ];
};

export default function Finale({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const root = ref.current;
    if (!root) return;
    const gctx = gsap.context(() => {
      drawThread(root.querySelectorAll(".thread path"), {
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          end: "bottom 92%",
          scrub: 0.7,
        },
      });
    }, root);
    return () => gctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative">
      <ThreadSeg
        seed={91}
        from={0.68}
        to={1}
        anchors={finaleAnchors}
        className="-z-[1]"
      />
      {children}
    </div>
  );
}
