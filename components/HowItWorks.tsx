"use client";

import { useEffect, useRef } from "react";
import { drawThread, gsap } from "@/lib/anim";
import type { Pt } from "@/lib/sketch";
import { threadX } from "@/lib/thread";
import SectionHead from "./SectionHead";
import ThreadSeg from "./ThreadSeg";

interface Step {
  n: string;
  title: string;
  copy: string;
  sketch: string[];
  ink: string[];
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "I find you.",
    copy: "I research local businesses whose websites are costing them customers. If that’s you, I’ve probably already started.",
    sketch: [
      "M22 46 L24 30 L96 31 L98 46",
      "M22 46q6.3 9 12.6 0q6.3 9 12.6 0q6.3 9 12.6 0q6.3 9 12.6 0q6.3 9 12.6 0q6.3 9 12.6 0",
      "M26 50 L25 92 L94 93 L95 50",
      "M55 93 L55 66 L71 65 L70 93",
      "M33 61 L48 62 L47 74 L33 74 Z",
      "M14 94 L106 92",
    ],
    ink: [
      "M78 64 m14 0 a14 14 0 1 1 -28 0 a14 14 0 1 1 28 0",
      "M88 74 L103 89",
    ],
  },
  {
    n: "02",
    title: "You see it first.",
    copy: "I build a complete demo — real pages, your menus, your photos — and send you the link. No pitch deck. The site is the pitch.",
    sketch: [
      "M18 30 L102 29 L103 90 L17 91 Z",
      "M18 42 L102 41",
      "M24 35 l5 1",
      "M33 36 l5 0",
      "M42 35 l5 1",
      "M28 54 L74 53",
      "M28 64 L88 64",
      "M28 74 L66 74",
    ],
    ink: [
      "M38 66 Q60 46 82 66 Q60 84 38 66 Z",
      "M60 65 m6 0 a6 6 0 1 1 -12 0 a6 6 0 1 1 12 0",
    ],
  },
  {
    n: "03",
    title: "We ink it.",
    copy: "If you like it, we make it real: your domain, bookings, ordering, the lot. If you don’t, you’ve lost nothing.",
    sketch: [
      "M60 16 L76 38 Q77 56 60 66 Q43 56 44 38 Z",
      "M60 32 L60 50",
      "M60 53 m3.5 0 a3.5 3.5 0 1 1 -7 0 a3.5 3.5 0 1 1 7 0",
    ],
    ink: [
      "M51 57 Q60 66 69 57",
      "M20 94 Q46 78 66 86 Q84 93 100 81",
    ],
  },
];

/* thread route: down the margin, through the three step diamonds, out
   toward the margin again — measured off the real diamond positions */
const methodAnchors = (w: number, h: number, root: HTMLElement): Pt[] => {
  const tx = threadX(w);
  const rr = root.getBoundingClientRect();
  const dias = Array.from(root.querySelectorAll(".step-diamond")).map((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2 };
  });
  if (dias.length < 3) return [{ x: tx, y: 0 }, { x: tx, y: h }];
  if (w < 768) {
    return [{ x: tx, y: 0 }, ...dias, { x: tx, y: h }];
  }
  return [
    { x: tx, y: 0 },
    { x: tx, y: dias[0].y - 70 },
    { x: dias[0].x - 46, y: dias[0].y },
    ...dias,
    // exit through the right margin, clear of the step copy
    { x: w - 30, y: dias[2].y + 70 },
    { x: w - 36, y: h * 0.8 },
    { x: w * 0.5, y: h * 0.95 },
    { x: tx, y: h },
  ];
};

export default function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const buildTl = (vars: gsap.TimelineVars) => {
      const tl = gsap.timeline(vars);
      tl.add(drawThread(wrap.querySelectorAll(".thread path"), { duration: 10 }), 0);
      // pops timed to the thread tip's arrival at each diamond (~18/33/48%)
      wrap.querySelectorAll<HTMLElement>(".step").forEach((step, i) => {
        const at = 1.7 + i * 1.5;
        tl.fromTo(
          step.querySelector(".step-diamond"),
          { scale: 0 },
          { scale: 1, duration: 0.25, ease: "back.out(2)" },
          at,
        )
          .fromTo(
            step.querySelectorAll(".pg-sketch path"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.8, stagger: 0.07, ease: "none" },
            at + 0.15,
          )
          .fromTo(
            step.querySelectorAll(".pg-ink path"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.6, stagger: 0.12, ease: "none" },
            at + 0.85,
          )
          .fromTo(
            step.querySelectorAll(".step-copy > *"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "none" },
            at + 0.5,
          );
      });
      return tl;
    };

    const mm = gsap.matchMedia(wrap);
    mm.add("(min-width: 48rem) and (prefers-reduced-motion: no-preference)", () => {
      buildTl({
        scrollTrigger: {
          trigger: wrap,
          start: "top 70%",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });
      gsap.fromTo(
        wrap.querySelectorAll("[data-reveal]"),
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top 85%", end: "top 45%", scrub: 0.6 },
        },
      );
    });
    mm.add("(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)", () => {
      buildTl({
        scrollTrigger: {
          trigger: wrap,
          start: "top 78%",
          end: "bottom 92%",
          scrub: 0.6,
        },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={wrapRef} className="stage-wrap-method">
      <section
        id="how"
        className="stage-sticky relative border-t border-ink/15 px-6 py-24 md:px-10 md:py-32"
      >
        <ThreadSeg
          seed={31}
          from={0.1}
          to={0.34}
          anchors={methodAnchors}
          className="-z-[1]"
        />
        <div className="stage-center mx-auto w-full max-w-[74rem]">
          <SectionHead
            index="02"
            name="METHOD"
            title="How this works."
            support="Three steps. No contract until the last one."
          />

          <div className="steps relative">
            <ol className="grid gap-14 md:grid-cols-3 md:gap-10">
              {STEPS.map((s) => (
                <li key={s.n} className="step relative pl-10 md:pl-0 md:pt-10">
                  <span
                    className="step-diamond absolute left-0 top-1 block h-2.5 w-2.5 rotate-45 border border-anno bg-paper md:top-0"
                    aria-hidden="true"
                  />
                  <svg
                    viewBox="0 0 120 120"
                    className="h-24 w-24"
                    aria-hidden="true"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <g
                      className="pg-sketch"
                      stroke="var(--color-underlay)"
                      strokeWidth={1.4}
                    >
                      {s.sketch.map((d) => (
                        <path key={d} d={d} pathLength={1} />
                      ))}
                    </g>
                    <g className="pg-ink" stroke="var(--color-ink)" strokeWidth={2.6}>
                      {s.ink.map((d) => (
                        <path key={d} d={d} pathLength={1} />
                      ))}
                    </g>
                  </svg>
                  <div className="step-copy mt-5">
                    <p className="anno">STEP {s.n}</p>
                    <h3 className="display mt-2 text-2xl italic">{s.title}</h3>
                    <p className="mt-3 max-w-[38ch] text-ink-soft">{s.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
