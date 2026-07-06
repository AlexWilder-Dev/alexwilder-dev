"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/anim";

const BUST = [
  "M150 42 q38 2 40 48 q2 44 -40 48 q-42 -4 -40 -48 q2 -46 40 -48",
  "M110 60 Q150 28 192 62",
  "M128 96 m16 0 a16 16 0 1 1 -32 0 a16 16 0 1 1 32 0",
  "M172 96 m16 0 a16 16 0 1 1 -32 0 a16 16 0 1 1 32 0",
  "M144 96 L156 96",
  "M60 330 Q70 250 120 240 Q150 260 180 240 Q230 250 240 330",
  "M138 240 L150 262 L164 240",
];

export default function About() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const root = rootRef.current;
    if (!root) return;
    const gctx = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 85%", end: "top 40%", scrub: 0.7 },
        },
      );
      gsap.fromTo(
        ".wire path",
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          stagger: 0.09,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 80%", end: "top 30%", scrub: 0.7 },
        },
      );
    }, root);
    return () => gctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="about"
      className="border-t border-ink/15 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[74rem]">
        <div className="mb-10 flex items-start justify-between" data-reveal>
          <p className="anno">04 — ABOUT</p>
          <p className="anno hidden shrink-0 border border-ink/40 px-2.5 py-1 text-[0.62rem] md:block">
            SHEET 04 OF 05
          </p>
        </div>
        <div className="grid items-start gap-12 md:grid-cols-12">
        <div className="md:col-span-4" data-reveal>
          <div
            data-thread="portrait"
            className="relative aspect-[4/5] max-w-[19rem] border border-ink/40"
          >
            {/* TODO: replace with real portrait */}
            <svg
              viewBox="0 0 300 375"
              className="wire absolute inset-0 h-full w-full"
              aria-hidden="true"
              fill="none"
              stroke="var(--color-underlay)"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {BUST.map((d) => (
                <path key={d} d={d} pathLength={1} />
              ))}
            </svg>
            <span className="absolute left-2 top-2 h-3 w-3 border-l border-t border-anno" aria-hidden="true" />
            <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-anno" aria-hidden="true" />
          </div>
          <p className="anno mt-6 text-[0.62rem]">
            PORTRAIT — TO FOLLOW · GRAPHITE, 2026
          </p>
        </div>

        <div className="md:col-span-7 md:col-start-6 md:pt-12" data-reveal>
          <p className="display text-[clamp(1.25rem,2vw,1.55rem)] leading-[1.5] text-ink">
            I&rsquo;m Alex. I&rsquo;ve shipped close to a hundred websites —
            most of them for places that serve food, pour beer, or take
            bookings. I grew up in Leicester, learned the trade in London, and
            work out of Oxford. I build fast because I&rsquo;ve done it a lot,
            and I show you the work first because I&rsquo;d want the same. No
            retainers, no jargon, no meetings that should have been emails. You
            deal with me, start to finish.
          </p>
          <p className="anno mt-8">ALEX WILDER — OXFORD, 2026</p>
        </div>
        </div>
      </div>
    </section>
  );
}
